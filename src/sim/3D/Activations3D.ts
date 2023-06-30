export class activations_3d
{
    public static default_activation(): string
    {
        return 'return -1.0/pow(2.0,(0.6*pow(x, 2.0)))+1.0;'
    }
}