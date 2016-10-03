import { Ctor } from './Ctor';

export class ComponentsCollection {

    private keyToComponentMap: { [index: string]: any } = {};
    private count: number = 0;

    public add(component: any, ...ctors: Ctor<any>[]): void {
        let keys = ctors.map(item => item.name);
        keys = keys.length > 0 ? keys : [this.getComponentKey(component)];

        keys.forEach(key => {
            this.addPairKeyComponent(key, component);
        });
    }

    public remove(component: any): boolean {
        let key = this.getComponentKey(component);

        let initialCount = this.count;

        for (let key in this.keyToComponentMap) {
            if (this.keyToComponentMap[key] == component) {
                this.keyToComponentMap[key] = undefined;
                this.count--;
            }
        }

        return this.count < initialCount;
    }

    public get<T>(ctor: Ctor<T>): T {
        return this.keyToComponentMap[this.getCtorKey(ctor)];
    }

    public contains(component: Ctor<any>): boolean {
        return this.get(<Ctor<any>>component);
    }

    public containsAny(components: Ctor<any>[]) {
        let result = false;

        components.forEach(c => {
            if (this.get(c)) {
                result = true;
                return;
            }
        });

        return result;
    }

    public containsAll(components: Ctor<any>[]) {
        let result = true;

        components.forEach(c => {
            if (!this.get(c)) {
                result = false;
            }
        });

        return result;
    }

    public toString(): string {
        return (ComponentsCollection as Ctor<ComponentsCollection>).name + " { " + this.count + " }";
    }

    private addPairKeyComponent(key: string, component: any) {
        if (this.keyToComponentMap[key]) {
            throw new Error("Component '" + key + "' already exists.");
        }
        else {
            this.keyToComponentMap[key] = component;
            this.count++;
        }
    }

    private getCtorKey<T>(ctor: Ctor<T>): string {
        return ctor.name;
    }

    private getComponentKey(component: any): string {
        return component.constructor.name;
    }
}