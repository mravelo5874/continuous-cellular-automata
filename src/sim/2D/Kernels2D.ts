export class kernels_2d
{
    public static worms_kernel(): Float32Array
    {
        let kernel = new Float32Array(9)
        // 0 1 2
        kernel[0] =  0.68
        kernel[1] = -0.90
        kernel[2] =  0.68
        // 3 4 5
        kernel[3] = -0.90
        kernel[4] = -0.66
        kernel[5] = -0.90
        // 6 7 8
        kernel[6] =  0.68
        kernel[7] = -0.90
        kernel[8] =  0.68
        return kernel
    }

    public static waves_kernel(): Float32Array
    {
        let kernel = new Float32Array(9)
        // 0 1 2
        kernel[0] =  0.565
        kernel[1] = -0.716
        kernel[2] =  0.565
        // 3 4 5
        kernel[3] = -0.716
        kernel[4] =  0.627
        kernel[5] = -0.716
        // 6 7 8
        kernel[6] =  0.565
        kernel[7] = -0.716
        kernel[8] =  0.565
        return kernel
    }

    public static paths_kernel(): Float32Array
    {
        let kernel = new Float32Array(9)
        // 0 1 2
        kernel[0] =  0.0
        kernel[1] =  1.0
        kernel[2] =  0.0
        // 3 4 5
        kernel[3] =  1.0
        kernel[4] =  1.0
        kernel[5] =  1.0
        // 6 7 8
        kernel[6] =  0.0
        kernel[7] =  1.0
        kernel[8] =  0.0
        return kernel
    }

    public static gol_kernel(): Float32Array
    {
        let kernel = new Float32Array(9)
        // 0 1 2
        kernel[0] =  1.0
        kernel[1] =  1.0
        kernel[2] =  1.0
        // 3 4 5
        kernel[3] =  1.0
        kernel[4] =  9.0
        kernel[5] =  1.0
        // 6 7 8
        kernel[6] =  1.0
        kernel[7] =  1.0
        kernel[8] =  1.0
        return kernel
    }

    public static stars_kernel(): Float32Array
    {
        let kernel = new Float32Array(9)
        // 0 1 2
        kernel[0] =  0.565
        kernel[1] = -0.716
        kernel[2] =  0.565
        // 3 4 5
        kernel[3] = -0.759
        kernel[4] =  0.627
        kernel[5] = -0.759
        // 6 7 8
        kernel[6] =  0.565
        kernel[7] = -0.716
        kernel[8] =  0.565
        return kernel
    }

    public static slime_kernel(): Float32Array
    {
        let kernel = new Float32Array(9)
        // 0 1 2
        kernel[0] =  0.80
        kernel[1] = -0.85
        kernel[2] =  0.80
        // 3 4 5
        kernel[3] = -0.85
        kernel[4] = -0.20
        kernel[5] = -0.85
        // 6 7 8
        kernel[6] =  0.80
        kernel[7] = -0.85
        kernel[8] =  0.80
        return kernel
    }

    public static cells_kernel(): Float32Array
    {
        let kernel = new Float32Array(9)
        // 0 1 2
        kernel[0] = -0.939
        kernel[1] =  0.880
        kernel[2] = -0.939
        // 3 4 5
        kernel[3] =  0.880
        kernel[4] =  0.400
        kernel[5] =  0.880
        // 6 7 8
        kernel[6] = -0.939
        kernel[7] =  0.880
        kernel[8] = -0.939
        return kernel
    }

    public static drops_kernel(): Float32Array
    {
        let kernel = new Float32Array(9)
        // 0 1 2
        kernel[0] = -0.764
        kernel[1] =  0.683
        kernel[2] = -0.764
        // 3 4 5
        kernel[3] =  0.683
        kernel[4] = -0.558
        kernel[5] =  0.683
        // 6 7 8
        kernel[6] = -0.764
        kernel[7] =  0.683
        kernel[8] = -0.764
        return kernel
    }

    public static lands_kernel(): Float32Array
    {
        let kernel = new Float32Array(9)
        // 0 1 2
        kernel[0] =  0.079
        kernel[1] = -0.765
        kernel[2] =  0.079
        // 3 4 5
        kernel[3] = -0.765
        kernel[4] =  0.765
        kernel[5] = -0.765
        // 6 7 8
        kernel[6] =  0.079
        kernel[7] = -0.765
        kernel[8] =  0.079
        return kernel
    }
}