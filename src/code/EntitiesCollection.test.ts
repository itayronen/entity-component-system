/// <reference path="../../typings/index.d.ts" />
import {EntitiesCollection, EntitiesObservation} from "./EntitiesCollection";
import {ComponentsCollection} from "./ComponentsCollection";
import {IEntity} from "./IEntity";
import {test, testAsync} from "./Test";

class TankEntity implements IEntity {
    public components: ComponentsCollection = new ComponentsCollection();

    constructor() {
        this.components.add(new GunsComponent(10));
        this.components.add(new ArmorComponent(7));
    }
}

class GunsComponent {
    public power: number = 1;

    constructor(power?: number) {
        if (power) {
            this.power = power;
        }
    }
}

class ArmorComponent {
    public durability: number = 1;

    constructor(durability?: number) {
        if (durability) {
            this.durability = durability;
        }
    }
}

describe("EntitiesCollection", () => {
    describe("add", () => {
        test("One item.", (t) => {
            t.arrange();
            let collection = new EntitiesCollection();
            let expected = new TankEntity();

            t.act();
            collection.add(expected);

            t.assert();
            let actual = collection.getByComponent(GunsComponent)[0];
            expect(actual).toBe(expected);
        });

        test("Multiple different items.", (t) => {
            t.arrange();
            let collection = new EntitiesCollection();
            let expected1 = new TankEntity();
            let expected2 = new TankEntity();

            t.act();
            collection.add(expected1);
            collection.add(expected2);

            t.assert();
            let actual = collection.getByComponent(GunsComponent);

            expect(actual.length).toBe(2);
            expect(actual.indexOf(expected1)).toBeGreaterThan(-1);
            expect(actual.indexOf(expected2)).toBeGreaterThan(-1);
        });
    });

    describe("getByComponent", () => {

        test("By component", (t) => {
            t.arrange();
            let collection = new EntitiesCollection();
            let item = new TankEntity();

            collection.add(item);

            t.act();
            let actual1 = collection.getByComponent(GunsComponent);
            let actual2 = collection.getByComponent(ArmorComponent);
            let empty = collection.getByComponent(Date);

            t.assert();
            expect(actual1[0]).toBe(item);
            expect(actual2[0]).toBe(item);
            expect(empty.length).toBe(0);
        });
    });

    describe("remove", () => {

        test("Simple", (t) => {
            t.arrange();
            let collection = new EntitiesCollection();
            let item = new TankEntity();

            collection.add(item);

            t.act();
            collection.remove(item);

            t.assert();
            let actual = collection.list;
            expect(actual.length).toBe(0);
        });
    });

    describe("addObservation", () => {

        test("Adding an entity that matches, triggers the observation.", (t) => {
            t.arrange();
            let collection = new EntitiesCollection();
            let item = new TankEntity();
            let result = false;

            t.act();

            collection.addObservation({
                add: entity => { result = true; }, remove: entity => { }, components: [GunsComponent]
            });

            collection.add(item);

            t.assert();
            expect(result).toBeTruthy();
        });

        test("Adding an entity that doesn't match, isn't triggering the observation", (t) => {
            t.arrange();
            let collection = new EntitiesCollection();
            let item = new TankEntity();
            let result = false;

            t.act();

            collection.addObservation({
                add: entity => { result = true; }, remove: entity => { }, components: [Date]
            });

            collection.add(item);

            t.assert();
            expect(result).toBeFalsy();
        });
    });

    describe("removeObservation", () => {

        test("Removing an entity that matches, triggers the observation.", (t) => {
            t.arrange();
            let collection = new EntitiesCollection();
            let item = new TankEntity();

            collection.add(item);

            let result = false;

            t.act();

            collection.addObservation({
                add: entity => { }, remove: entity => { result = true; }, components: [GunsComponent]
            });

            collection.remove(item);

            t.assert();
            expect(result).toBeTruthy();
        });

        test("Removing an entity that doesn't match, isn't triggering the observation.", (t) => {
            t.arrange();
            let collection = new EntitiesCollection();
            let item = new TankEntity();

            collection.add(item);

            let result = true;

            t.act();

            collection.addObservation({
                add: entity => { }, remove: entity => { result = false; }, components: [Date]
            });

            collection.remove(item);

            t.assert();
            expect(result).toBeTruthy();
        });
    });
});