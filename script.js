let DBRExtension = {
  reader:undefined,
  enhancer:undefined,
  regionID:undefined,
  interval:undefined,
  processing:undefined,
  barcodeResults:undefined,
  open: async function(){
    await this.enhancer.open(true);
  },
  close: function(){
    this.enhancer.close(true);
  },
  startScanning: function(){
    this.stopScanning();
    let pThis = this;
    const captureAndDecode = async function() {
      if (!pThis.enhancer || !pThis.reader) {
        return;
      }
      if (pThis.enhancer.isOpen() === false) {
        return;
      }
      if (pThis.processing === true) {
        return;
      }
      pThis.processing = true; // set decoding to true so that the next frame will be skipped if the decoding has not completed.
      let frame = pThis.enhancer.getFrame();
      if (frame) {
        let results = await pThis.reader.decode(frame);
        if (results.length > 0) {
          this.barcodeResults = results;
          if ('apex' in window) {
            apex.server.process("SINGLE_BARCODE_SCANNED", {x01:results[0].barcodeText}, {dataType: "text", success: function(){}});
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
    this.reader = await Dynamsoft.DBR.BarcodeScanner.createInstance();
    this.enhancer = await Dynamsoft.DCE.CameraEnhancer.createInstance();
    await this.enhancer.setUIElement(Dynamsoft.DCE.CameraEnhancer.defaultUIElementURL);
    let container = document.createElement("div");
    container.id = "enhancerUIContainer";
    if ('apex' in window) {
      this.regionID = pConfig.regionID;
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
    this.enhancer.on("played", (playCallbackInfo) => {
      if (this.interval) {
        this.startScanning();
      }
    });
    container.appendChild(this.enhancer.getUIElement());
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
    await this.loadLibrary("https://cdn.jsdelivr.net/npm/dynamsoft-javascript-barcode@9.6.11/dist/dbr.js","text/javascript");
    await this.loadLibrary("https://cdn.jsdelivr.net/npm/dynamsoft-camera-enhancer@3.3.1/dist/dce.js","text/javascript");
    if (pConfig.license) {
      Dynamsoft.DBR.BarcodeScanner.license = pConfig.license;
    }else{
      Dynamsoft.DBR.BarcodeScanner.license = "DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTE2NDk4Mjk3OTI2MzUiLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSIsInNlc3Npb25QYXNzd29yZCI6IndTcGR6Vm05WDJrcEQ5YUoifQ==";
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
