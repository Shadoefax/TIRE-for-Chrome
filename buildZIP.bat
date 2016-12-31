:: Chrome extension id: ilpojdjbhjfkokelclednlnbbodilbdo
:: ID: ilpojdjbhjfkokelclednlnbbodilbdo
:: Chrome store url: https://chrome.google.com/webstore/detail/text-input-recover-extens/gjhalkgpmhdpbfjdmeghbdbmbannipjf?authuser=0
set dest=TIRE0.0.0.7
set ZIP="C:\Program Files\7-Zip\7z.exe"
del %dest%.zip
set homeDir="C:\Users\cbake\Desktop\Extension Development\Chrome extensions\TIRE"
cd %homeDir%
rd /s /q %homeDir%\TIRE
mkdir %homeDir%\TIRE
::mkdir %homeDir%\TIRE\themes\default
::mkdir %homeDir%\TIRE\images
xcopy manifest.json TIRE /v/f
xcopy tireCommon.js TIRE /v/f
xcopy tireContent.js TIRE /v/f
xcopy tireBackground.js TIRE /v/f
xcopy tireOptions.html TIRE /v/f
xcopy tireOptions.js TIRE /v/f
xcopy sandbox.html TIRE /v/f
xcopy propsConsole.js TIRE /v/f

xcopy work\tire.css TIRE /v/f
xcopy work\tire16x16.png TIRE /v/f
xcopy work\tire38x38.png TIRE /v/f
xcopy work\taffy.js TIRE /v/f
xcopy work\TIREoptionsheader.png TIRE /v/f
xcopy work\TIREbutton.png TIRE /v/f

%ZIP% a -tzip -mx=9 %dest%.zip .\TIRE\*
::pause
