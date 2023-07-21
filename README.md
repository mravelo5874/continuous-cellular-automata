![alt text](https://github.com/mravelo5874/continuous-cellular-automata/blob/main/public/gifs/worms_1c.gif)

# Continuous Cellular Automata

Welcome to my continuous cellular automata simulations!

This application lets you explore both 2D and 3D continuous cellular automata by modifing their kernel values and activation function. There are a variety of presets to choose from for each simulation, each showcasing the incredible patterns that emerge from simple mathematical operations.

Upon entering the application, you are greeted by one of my favorite 2D automata, worms. As seen in this video https://www.youtube.com/watch?v=3H79ZcBuw4M, these worms are quite popular and are a great introductory automata. I very much admire their complex and life-like nature.

Switching over to 3D, you will notice a very different looking simulation. The automata cells are contained within an enclosed cube, yet their nature is nearly identical as their 2D counterpart. The first 3D automata you encounter is named fission, purely based on its visuals as a complex bubbling mess. Use the mouse to orbit the camera and to zoom in and out!

This website started out as a final project for my graphics course at UT Austin. It has since evolved to incorporate a miriad of customizations, allowing users to explore a near infinite amount of possibilities that continuous cellular automata allow for.

A great inspiration for this project was https://neuralpatterns.io by Max Robinson [https://github.com/MaxRobinsonTheGreat] which lets users explore 2D continuous cellular automata (though they refer it as neural cellular automata). Another great source of help was https://fiendchain.github.io/3D-Cellular-Automata/ by William Yang [https://github.com/FiendChain] which lets users play with classical 3D cellular automata. Please check out their work as this project would have not been possible without them!

If you wish to check out the code for this project, visit the github repository at https://github.com/mravelo5874/continuous-cellular-automata.

# Intructions

All interactions with the simulations are done using the gui menu and the mouse. The gui menu can be toggled on and off using the bottom left button. By default it is open.

You can toggle between the 2D and 3D simulations using the toggle at the top of the menu. Additionally, you can pause the simulations and toggle anti-aliasing (it is much more noticable on the 2D automata).

If you wish to customize your automata or load some presets, pressing the 'customize automata!' button will reveal many more options and tools to play with.

### 2D Automata Options:

The automata module allows you to load in some other preset which were hand-picked based on their interesting visuals. The seed field is the string used to generate the random state when the automata is reset. Pressing the 'new seed' button will generate a random number with 32 digits and the 'reset automata' button will reset the automata using the seed.

The options module lets you change the brush size and zoom level of the canvas where the automata live. Use the left mouse button to draw and the right mouse button to erase.

The shader module let you choose from four different shader types, only affecting how the automata look and not how they are calulated.

The kernel 3x3 module let you type in any value for the kernel used in the convolution calculation. There are some symmetry toggles to choose from which let you modify multiple kernel values at once using their respective symmety. More information as to what the kernel is and how convolition works is provided in the Explanation section below. The 'randomize kernel' button randomized the kernel values and uses the symmeties provided. This is a great way to explore the limitless possibilities within the simulation and is how I found many of the presets provided.

The activation function module let you change the activation function performed after the convolution is done. It is written in OpenGL Shading Language (GLSL) which is very similar to the C programming language. The input to this function is the variable x, and the function must return a floating-point number. If you which to load in a function, there is a drop down menu provided with popular activation functions. If there is an error in your function, the canvas will freeze and an error message will be printed to your browser's console. Pressing F12 on your keyboard will let you view the console and the error message for debugging.

The save & load automata lets you export and import your custom automata as a .json file. You can give your automata a name which will be used to name your file. Upon pressing export, your file will be downloaded to where your browser's default download folder is. 

You can view your canvas's resolution at the bottom of the gui menu. Keep in mind that this resolution is dependent on the current zoom level. Setting the zoom level to 1.0 will provide a pixel-perfect canvas and the resolution will match your browser's window. You can also view the current fps of the simulation. Each frame, a new state is calculated and rendered to your canvas.

### 3D Automata Options:

[TODO] 3D automata options here.

## Explanation
[TODO] write explanation here.

## Gallery

![alt text](https://github.com/mravelo5874/continuous-cellular-automata/blob/main/public/gifs/worms_3c.gif)
'worms' preset using the 'red green blue channels' shader.

![alt text](https://github.com/mravelo5874/continuous-cellular-automata/blob/main/public/gifs/cells_1c.gif)
'cells' preset using the 'alpha channel' shader.