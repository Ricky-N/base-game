This project has some cool integration with Tiled map editor, you really
don't want to be specifying maps yourself and if you are autogenerating
maps, it is a nice format to store things in so that you can import the map
into Tiled and check out what was built.

If you go download Tiled, you can open the .tmx file here, edit your map,
and then export as json. Make sure that when you go to Map -> Map Properties
that "Tile Layer Format" is set to CSV as the IgeTiledComponent doesn't
understand any of the compressed data formats. Yes this leads to bigger data.

Once you have exported your file, you will need to copy the json formatted
text and drop it in between the module export stuff in the map.js file,
it should be obvious what I mean if you look at the difference between the
two files. This should of course be automated :)

The map is dealt with mostly in Background.js, on the server we create
physics objects from the object layers and on the server we create textures
to render from the tile layers. If you want something to be an object the
character can't move through, then in tiled make a new rectangle object
in the object layer that covers all of these. I recommend making them as
big as possible so you don't create extra entities that may slow
down your game.

There are possible improvements everywhere! :)
