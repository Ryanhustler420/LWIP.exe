# LWIP.exe
An standalone executable for image manipulation task, such as giving padding to an image or images, making image greyscale and such... 

> npm i pkg -g

```cmd
> C:/Users/Gaurav> npm i
```

```cmd
> C:/Users/Gaurav> pkg --output dist/${name} .
```

## Examples (Single Image Pad)

```cmd
> C:/Users/Gaurav> setup.exe please run pad --url "E:\TourPictures\20180527_124950.jpg" --args 50 50 50 50 "white"
```

## Examples (Multiple Image Pad)

```cmd
C:/Users/Gaurav> setup.exe please run pad --url "E:\TourPictures\20180527_124950.jpg" --urls "E:\TourPictures\20180527_124950.jpg" "E:\_RaisehandMain\Products\APPS\More Files\Images\desi.png" --dump "./temp" --output_name "same" --args 50 50 50 50 "white"
```
