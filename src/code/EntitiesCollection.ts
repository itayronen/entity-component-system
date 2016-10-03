import {IEntity} from "./IEntity";
import {Ctor} from "./Ctor";

export class EntitiesObservation {
    public add: (entity: IEntity) => void;
    public remove: (entity: IEntity) => void;
    public components: Ctor<any>[];
}

export class EntitiesCollection {

    private observations: EntitiesObservation[] = [];

    public list: IEntity[] = [];

    public add(entity: IEntity): void {
        this.list.push(entity);

        this.observations.forEach(observation => {
            if (entity.components.containsAll(observation.components)) {
                observation.add(entity);
            }
        });
    }

    public remove(entity: IEntity): boolean {
        let index = this.list.indexOf(entity);

        if (index >= 0) {
            this.list.splice(index, 1);

            this.observations.forEach(observation => {
                if (entity.components.containsAll(observation.components)) {
                    observation.remove(entity);
                }
            });

            return true;
        }

        return false;
    }

    public getByComponent(component: Ctor<any>): IEntity[] {
        return this.list.filter(entity => entity.components.contains(component));
    }

    public getByComponentAny(...components: Ctor<any>[]): IEntity[] {
        return this.list.filter(entity => {
            return entity.components.containsAny(components);
        });
    }

    public addObservation(observation: EntitiesObservation) {
        this.observations.push(observation);
    }

    public removeObserver(observation: EntitiesObservation) {
        this.observations.splice(this.observations.indexOf(observation), 1);
    }
}