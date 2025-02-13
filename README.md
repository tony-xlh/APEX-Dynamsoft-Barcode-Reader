# APEX-Dynamsoft-Barcode-Reader

APEX Plug-in to scan barcodes using Dynamsoft Barcode Reader v9. [Step-by-step Guide](https://github.com/tony-xlh/APEX-Dynamsoft-Barcode-Reader/issues/2)

[Online demo](https://apex.oracle.com/pls/apex/r/dynamsoft/dynamsoft-demos/barcode-scanner?session=7986978607494)

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
Run the following code to get the barcode results of the last successful scan:

```js
DBRExtension.getResults();
```

## Attributes

* styles. CSS styles for the container.
* license. License for Dynamsoft Barcode Reader. You can apply your license [here](https://www.dynamsoft.com/customer/license/trialLicense?product=dbr).
* Barcode result container. Specify the ID for the container of the barcode result.
* template. Specify the runtime settings for Dynamsoft Barcode Reader.

## Blog

[How to Scan Barcodes in an Oracle APEX Application](https://www.dynamsoft.com/codepool/oracle-apex-barcode-scanner.html)


