export class kernels_3d
{
    public static default_kernel(): Float32Array
    {
        let kernel = new Float32Array(27)
        // face 1
        kernel[0] =  0.0 // layer 0
        kernel[1] =  0.0
        kernel[2] =  0.0
        kernel[3] =  0.0 // layer 1
        kernel[4] =  0.0
        kernel[5] =  0.0
        kernel[6] =  0.0 // layer 2
        kernel[7] =  0.0
        kernel[8] =  0.0
        // face 2
        kernel[9] =  0.0 // layer 0
        kernel[10] =  0.0
        kernel[11] =  0.0
        kernel[12] =  0.0 // layer 1
        kernel[13] =  1.0
        kernel[14] =  0.0
        kernel[15] =  0.0 // layer 2
        kernel[16] =  0.0
        kernel[17] =  0.0
        // face 3
        kernel[18] =  0.0 // layer 0
        kernel[19] =  0.0
        kernel[20] =  0.0
        kernel[21] =  0.0 // layer 1
        kernel[22] =  0.0
        kernel[23] =  0.0
        kernel[24] =  0.0 // layer 2
        kernel[25] =  0.0
        kernel[26] =  0.0
        return kernel
    }
}