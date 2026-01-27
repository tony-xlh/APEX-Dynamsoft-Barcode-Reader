let DBRExtension = {
  reader:undefined,
  enhancer:undefined,
  regionID:undefined,
  item:undefined,
  interval:undefined,
  processing:undefined,
  barcodeResults:undefined,
  open: async function(){
    document.getElementById("enhancerUIContainer").style.display = "";
    await this.enhancer.open();
  },
  close: function(){
    this.enhancer.close(true);
    document.getElementById("enhancerUIContainer").style.display = "none";
  },
  startScanning: function(){
    this.stopScanning();
    let pThis = this;
    const captureAndDecode = async function() {
      if (!pThis.enhancer || !pThis.router) {
        return;
      }
      if (pThis.enhancer.isOpen() === false) {
        return;
      }
      if (pThis.processing === true) {
        return;
      }
      pThis.processing = true; // set decoding to true so that the next frame will be skipped if the decoding has not completed.
      let frame = pThis.enhancer.fetchImage();
      console.log(frame);
      if (frame) {
        let capturedResult = await pThis.router.capture(frame,"ReadBarcodes_Default");
        console.log(capturedResult);
        if (capturedResult.decodedBarcodesResult) {
          let results = capturedResult.decodedBarcodesResult.barcodeResultItems;
          pThis.barcodeResults = results;
          if ('apex' in window) {
            if (pThis.item) {
              apex.item(pThis.item).setValue(results[0].text);
            }
            //if (pThis.ajax) {
            //  apex.server.process("SINGLE_BARCODE_SCANNED", {x01:results[0].barcodeText}, {dataType: "text", success: function(){}});
            //}
          }
        }
        
        pThis.processing = false;
      }
    }
    this.interval = setInterval(captureAndDecode,100); // set an interval to read barcodes
  },
  stopScanning: function(){
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
    this.processing = false;
  },
  init: async function(pConfig){
    Dynamsoft.Core.CoreModule.loadWasm();
    this.router = await Dynamsoft.CVR.CaptureVisionRouter.createInstance();
    let cameraView = await Dynamsoft.DCE.CameraView.createInstance();
    this.enhancer = await Dynamsoft.DCE.CameraEnhancer.createInstance(cameraView);
    let container = document.createElement("div");
    container.id = "enhancerUIContainer";
    container.append(cameraView.getUIElement());
    if ('apex' in window) {
      this.regionID = pConfig.regionID;
      this.item = pConfig.item;
      const region = document.getElementById(this.regionID);
      region.appendChild(container);
    }else{
      document.body.appendChild(container);
    }
    if (pConfig.styles) {
      let styles = JSON.parse(pConfig.styles); //{width:"100%"} e.g.
      for (const key in styles) {
        container.style[key] = styles[key];
      }
    }
    if (pConfig.template) {
      await this.router.initSettings(pConfig.template);
    }
    this.enhancer.on("played", (playCallbackInfo) => {
      if (this.interval) {
        this.startScanning();
      }
    });

    // The following line hides the close button
    //document.getElementsByClassName("dce-btn-close")[0].style.display = "none";
    container.style.display = "none";
    if ('apex' in window) {
      apex.region.create(
        pConfig.regionID,
        {                
          type: 'Dynamsoft Barcode Reader',
          open: async function(){
            await DBRExtension.open();
          },
          close: function(){
            DBRExtension.close();
          },
          startScanning: function() {
            DBRExtension.startScanning();
          },
          stopScanning: function() {
            DBRExtension.stopScanning();
          },
          getResults: function(){
            return DBRExtension.getResults();
          }
        }
      );
    }
  },
  getResults: function() {
    return this.barcodeResults;
  },
  load: async function(pConfig){
    try {
      window.Dynamsoft.CVR.CaptureVisionRouter;
    }catch{
      await this.loadLibrary("https://cdn.jsdelivr.net/npm/dynamsoft-barcode-reader-bundle@11.2.4000/dist/dbr.bundle.js","text/javascript");
    }
    if (pConfig.license) {
      Dynamsoft.License.LicenseManager.initLicense(pConfig.license);
    }else{
      Dynamsoft.License.LicenseManager.initLicense("DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTE2NDk4Mjk3OTI2MzUiLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSIsInNlc3Npb25QYXNzd29yZCI6IndTcGR6Vm05WDJrcEQ5YUoifQ==");
    }

  },
  loadLibrary: function (src,type,id,data){
    return new Promise(function (resolve, reject) {
      let scriptEle = document.createElement("script");
      scriptEle.setAttribute("type", type);
      scriptEle.setAttribute("src", src);
      if (id) {
        scriptEle.id = id;
      }
      if (data) {
        for (let key in data) {
          scriptEle.setAttribute(key, data[key]);
        }
      }
      document.body.appendChild(scriptEle);
      scriptEle.addEventListener("load", () => {
        console.log(src+" loaded")
        resolve(true);
      });
      scriptEle.addEventListener("error", (ev) => {
        console.log("Error on loading "+src, ev);
        reject(ev);
      });
    });
  },
  loadStyle: function (url) {
    return new Promise(function (resolve, reject) {
      let linkEle = document.createElement('link')
      linkEle.type = 'text/css'
      linkEle.rel = 'stylesheet'
      linkEle.href = url
      let head = document.getElementsByTagName('head')[0]
      head.appendChild(linkEle)
      linkEle.addEventListener("load", () => {
        console.log(url+" loaded")
        resolve(true);
      });
      linkEle.addEventListener("error", (ev) => {
        console.log("Error on loading "+url, ev);
        reject(ev);
      });
    });
  }
}
