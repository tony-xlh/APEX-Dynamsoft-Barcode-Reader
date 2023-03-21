# APEX-Dynamsoft-Barcode-Reader

APEX Plug-in to scan barcodes using Dynamsoft Barcode Reader

Run the following code to start scanning:

```js
(async () => {
  if (DBRExtension.reader) {
    await DBRExtension.open(); // open the camera
    DBRExtension.startScanning(); // start a loop to read barcodes from camera frames
  }else{
    alert("The barcode scanner is still initializing.");
  }
})();
```


Run the following code to stop scanning:

```js
DBRExtension.stopScanning();
DBRExtension.close();
```
