![alt text](https://github.com/mravelo5874/continuous-cellular-automata/blob/main/public/gifs/fission_3d.gif)
> 'fission' 3D automata preset using the 'yellow green blue' colormap.

# Continuous Cellular Automata

*Welcome to my continuous cellular automata simulations!*

This application lets you explore both 2D and 3D continuous cellular automata by modifying their kernel values and activation functions. There are a variety of presets to choose from for each simulation, each showcasing the incredible patterns that emerge from simple mathematical operations.

Upon entering the application, you are greeted by one of my favorite 2D automata, worms. As seen in [this video](https://www.youtube.com/watch?v=3H79ZcBuw4M), these worms are quite popular and are a great introductory automata. I very much admire their complex and life-like nature.

Switching over to 3D, you will notice a very different looking simulation. The automata cells are contained within an enclosed cube, yet their nature is nearly identical as their 2D counterpart. The first 3D automata you encounter is named fission, purely based on its visuals as a complex bubbling mess. Use the mouse to orbit the camera and to zoom in and out!

This website started out as a final project for my graphics course at UT Austin. It has since evolved to incorporate a myriad of customizations, allowing users to explore a near infinite amount of possibilities that continuous cellular automata allow for.

A great inspiration for this project was https://neuralpatterns.io by [Max Robinson](https://github.com/MaxRobinsonTheGreat) which lets users explore 2D continuous cellular automata (though they refer to it as neural cellular automata). Another great source of help was https://fiendchain.github.io/3D-Cellular-Automata/ by [William Yang](https://github.com/FiendChain) which lets users play with classical 3D cellular automata. Please check out their work as this project would have not been possible without them!

If you wish to check out the code for this project, visit the [github repository](https://github.com/mravelo5874/continuous-cellular-automata).

- You can interact with this project on my website [here](https://marcoravelo.com/).

![alt text](https://github.com/mravelo5874/continuous-cellular-automata/blob/main/public/gifs/worms_1c.gif)
> 'worms' 2D automata preset using the 'black and white' shader.

# What are Continuous Cellular Automata?

If you look up continuous cellular automata on wikipedia, this is the result you will get:

> A continuous automaton can be described as a cellular automaton extended so the valid states a cell can take are not just discrete (for example, the states consist of integers between 0 and 3), but continuous, for example, the real number range [0,1]. The cells however remain discretely separated from each other.

This definition, while correct, provides a limited and some what unapparent view on the subject. In truth, continuous cellular automata expand upon classical cellular automata, where instead of each cell being limited to a single state, they are free to be represented by any real number. In the case of this project, each cell's value can be any number between 0 and 1. This is the basis for the name *continuous* cellular automata.

0. In the 2D simulation, the canvas contains a grid of cells each initialized with a randomly generated number. When the zoom level is set to 1, each cell can be rendered by a single pixel. In order to get to the next state, a computation update must be performed. This computation update can be split into two distinct operations: a convolution and an activation.

1. First, the convolution. Using a 3x3 grid of values referred to as a *kernel*, a cell's value is modified using its neighboring cells' values. Let's do this one step at a time. The first neighbor, one down and one to the left of the cell (-1, -1), is found and its value is stored. This value is multiplied by the kernel's respective value, one down and one to the left of the center square (-1, -1). Then the next neighbor, one down from the cell (0, -1), is found and its value is multiplied by the kernel's respective value one down from the center square (0, -1). This is done for each of the cell's 8 adjacent neighbors as well as its own value found at (0, 0) from the center. The result is 9 numbers. Once we have these 9 numbers, we sum them up to a single number.

2. Secondly, the activation. Once we have calculated the sum of values from the convolution step, we are left with a single number. This number is then *sent through* a function to get another number. That is all the activation function does; It maps one number to another. This final number is then clamped between 0 and 1 (in case it is out of bounds as a valid cell value). This number is the new value of the cell. 

3. In order to complete a computation update, each cell must go through this process. The result is a new grid of cells which is then rendered to the canvas. You could most likely guess what happens next... the computation update happens again! And again and again, resulting in an infinite sequential set of states being rendered in real time, an animation. 

![alt text](https://github.com/mravelo5874/continuous-cellular-automata/blob/main/public/gifs/fluids_3d.gif)
> 'fluids' 3D automata preset using the 'plasma' colormap.

# Instructions

All interactions with the simulations are done using the gui menu and the mouse. The gui menu can be toggled on and off using the bottom left button. By default it is open.

You can toggle between the 2D and 3D simulations using the toggle at the top of the menu. Additionally, you can pause the simulations and toggle anti-aliasing (it is much more noticeable on the 2D automata).

If you wish to customize your automata or load some presets, pressing the 'customize automata!' button will reveal many more options and tools to play with.

### 2D Automata Options:

- The automata module allows you to load in some other presets which were hand-picked based on their interesting visuals. The seed field is the string used to generate the random state when the automata is reset. Pressing the 'new seed' button will generate a random number with 32 digits and the 'reset automata' button will reset the automata using the seed.

- The options module lets you change the brush size and zoom level of the canvas where the automata live. Use the left mouse button to draw and the right mouse button to erase.

- The shader module lets you choose from four different shader types, only affecting how the automata look and not how they are calculated.

- The kernel 3x3 module lets you type in any value for the kernel used in the convolution calculation. There are some symmetry toggles to choose from which let you modify multiple kernel values at once using their respective symmetry. More information as to what the kernel is and how convolution works is provided in the Explanation section below. The 'randomize kernel' button randomizes the kernel values and uses the symmetries provided. This is a great way to explore the limitless possibilities within the simulation and is how I found many of the presets provided.

- The activation function module lets you change the activation function performed after the convolution is done. It is written in OpenGL Shading Language (GLSL) which is very similar to the C programming language. The input to this function is the variable x, and the function must return a floating-point number. If you wish to load in a function, there is a drop down menu provided with popular activation functions. If there is an error in your function, the canvas will freeze and an error message will be printed to your browser's console. Pressing F12 on your keyboard will let you view the console and the error message for debugging.

- The save & load automata lets you export and import your custom automata as a .json file. You can give your automata a name which will be used to name your file. Upon pressing export, your file will be downloaded to where your browser's default download folder is. 

- You can view your canvas's resolution at the bottom of the gui menu. Keep in mind that this resolution is dependent on the current zoom level. Setting the zoom level to 1.0 will provide a pixel-perfect canvas and the resolution will match your browser's window. You can also view the current fps of the simulation. Each frame, a new state is calculated and rendered to your canvas.

### 3D Automata Options:

- The automata module allows you to load in some other presets which were hand-picked based on their interesting visuals. The seed field is the string used to generate the random state when the automata is reset. Pressing the 'new seed' button will generate a random number with 32 digits and the 'reset automata' button will reset the automata using the seed. The 'reset camera' toggle will reset the camera whenever you press the reset button.

- The options module includes various toggles and sliders which affect the 3D automata simulation. The 'wrap' toggle lets the automata *wrap around* to the other side of the cube, meaning that automata on the very edge of the volume can affect and will be affected by the automata on the opposite side of the volume. By default, this is set as off. The 'skip frames' toggle lets the simulation calculate two states between renders. This is done to avoid certain visual artifacts which can be quite difficult to look at. By default this is set as on. Turn off at your own discretion. The 'orbit' toggle lets the camera orbit the volume slowly when no input is detected. This is set as on by default. The 'volume size' slider lets your change the size of the volume. It corresponds to each of the three sides of the cube. So a volume of size 64 will contain 64\*64\*64=262144 cells within it. The 'compute delay' slider lets you modify the computation speed relative to the renderer. A compute delay of 1 means that a state is computed each render frame. A compute delay of 8 means that a state is rendered every 8 render frames.

- The render module changes the visuals of the simulation. The 'blend' toggle blends the cells together (similar to anti-aliasing on the 2D simulation). The 'colormap' dropdown lets you choose between 6 different colormaps.

- The kernel 3x3x3 module lets you type in any value for the kernel used in the convolution calculation. Because the kernel for a 3D volume is also in 3D, each of the three layers is shown as a flat 3x3 kernel. There are some symmetry toggles to choose from which let you modify multiple kernel values at once using their respective symmetry. More information as to what the kernel is and how convolution works is provided in the Explanation section below. The 'randomize kernel' button randomizes the kernel values and uses the symmetries provided. This is a great way to explore the limitless possibilities within the simulation and is how I found many of the presets provided.

- The activation function module lets you change the activation function performed after the convolution is done. It is written in OpenGL Shading Language (GLSL) which is very similar to the C programming language. The input to this function is the variable x, and the function must return a floating-point number. If you wish to load in a function, there is a drop down menu provided with popular activation functions. If there is an error in your function, the canvas will freeze and an error message will be printed to your browser's console. Pressing F12 on your keyboard will let you view the console and the error message for debugging.

- The save & load automata lets you export and import your custom automata as a .json file. You can give your automata a name which will be used to name your file. Upon pressing export, your file will be downloaded to where your browser's default download folder is. 

- You can view your canvas's resolution at the bottom of the gui menu. Keep in mind that this resolution is dependent on the current zoom level. Setting the zoom level to 1.0 will provide a pixel-perfect canvas and the resolution will match your browser's window. You can also view the current fps of the simulation. Each frame, a new state is calculated and rendered to your canvas.

## Gallery

![alt text](https://github.com/mravelo5874/continuous-cellular-automata/blob/main/public/gifs/worms_3c.gif)
> 'worms' 2D automata preset using the 'red green blue channels' shader.

![alt text](https://github.com/mravelo5874/continuous-cellular-automata/blob/main/public/gifs/power_3d.gif)
> 'power' 3D automata preset using the 'green' colormap.

![alt text](https://github.com/mravelo5874/continuous-cellular-automata/blob/main/public/gifs/cells_1c.gif)
> 'cells' 2D automata preset using the 'alpha channel' shader.

![alt text](https://github.com/mravelo5874/continuous-cellular-automata/blob/main/public/gifs/gurgle_3d.gif)
> 'gurgle' 3D automata preset using the 'cool warm' colormap.

![alt text](https://github.com/mravelo5874/continuous-cellular-automata/blob/main/public/gifs/comets_1c.gif)
> 'comets' 2D automata preset using the 'black and white' shader.

![alt text](https://github.com/mravelo5874/continuous-cellular-automata/blob/main/public/gifs/computer_3d.gif)
> 'computer' 3D automata preset using the 'rainbow' colormap.

![alt text](https://github.com/mravelo5874/continuous-cellular-automata/blob/main/public/gifs/paths_3c.gif)
> 'paths' 2D automata preset using the 'red green blue channels' shader.

![alt text](https://github.com/mravelo5874/continuous-cellular-automata/blob/main/public/gifs/anemone_3d.gif)
> 'anemone' 3D automata preset using the 'cool warm' colormap.

![alt text](https://github.com/mravelo5874/continuous-cellular-automata/blob/main/public/gifs/smoke_1c.gif)
> 'smoke' 2D automata preset using the 'black and white' shader.


