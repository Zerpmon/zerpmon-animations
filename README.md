# How to generate the zerpmon animations

1. go to the main repo folder<br><br>

2. go inside ZerpmonAnimations folder<br><br>

   ```sh
   cd ZerpmonAnimations
   ```

3. create folder structure

   ```sh
   mkdir -p ZerpmonImages imageChunks logs/all logs/download pngSequences Spritesheets ZerpmonImages
   ```

4. add tinifyKey in generateSpritesheet.js
   
5. install dependencies

   ```sh
   npm i
   ```

6. download the nft list

   ```sh
   node downloadImage.js
   ```

7. run the animations and save in the r2 and images
   ```sh
   node renderAnimations.js
   ```
