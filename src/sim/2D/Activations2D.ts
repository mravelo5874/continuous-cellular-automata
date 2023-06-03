export class activations_2d
{
    public static worms_activation(): string
    {
        return 'return -1.0/pow(2.0,(0.6*pow(x, 2.0)))+1.0;'
    }

    public static waves_activation(): string
    {
        return 'return abs(1.2*x);'
    }

    public static paths_activation(): string
    {
        return 'return 1.0/pow(2.0,(pow(x-3.5, 2.0)));'
    }

    public static gol_activation(): string
    {
        return 'if(x == 3.0||x == 11.0||x == 12.0){return 1.0;}return 0.0;'
    }

    public static stars_activation(): string
    {
        return 'return abs(x);'
    }

    public static slime_activation(): string
    {
        return 'return -1.0/(0.89*pow(x, 2.0)+1.0)+1.0;'
    }

    public static cells_activation(): string
    {
        return 'return -1.0/(0.9*pow(x, 2.0)+1.0)+1.0;'
    }

    public static drops_activation(): string
    {
        return 'return -1.0/pow(2.0, (pow(x, 2.0)))+1.0;'
    }

    public static lands_activation(): string
    {
        return 'return (exp(2.0*x)-1.0)/(exp(2.0*x)+1.0);'
    }
}