export class kernels_3d
{
    public static default_kernel(): Float32Array
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
}