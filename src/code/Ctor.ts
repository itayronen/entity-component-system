export interface Ctor<T> {
    new (...p: any[]): T;
    name?: string;
}