/// <reference path="../../typings/index.d.ts" />
import {ComponentsCollection} from "./ComponentsCollection";
import {test, testAsync} from "itay-test";

describe("ComponentsCollection", () => {
    describe("add", () => {
        test("One item.", (t) => {
            t.arrange();
            let collection = new ComponentsCollection();
            let expected = 1;

            t.act();
            collection.add(expected);

            t.assert();
            let actual = collection.get(Number);
            expect(actual).toBe(expected);
        });

        test("Multiple different items.", (t) => {
            t.arrange();
            let collection = new ComponentsCollection();

            let expected1 = 1;
            let expected2 = true;
            let expected3 = new Date();

            t.act();
            collection.add(expected1);
            collection.add(expected2);
            collection.add(expected3);

            t.assert();
            let actual2 = collection.get(Boolean);
            let actual1 = collection.get(Number);
            let actual3 = collection.get(Date);

            expect(actual1).toBe(expected1);
            expect(actual2).toBe(expected2);
            expect(actual3).toBe(expected3);
        });

        test("Two items of the same type - throws.", (t) => {
            t.arrange();
            let collection = new ComponentsCollection();

            let item1 = 1;
            let item2 = 2;

            collection.add(item1);

            t.assert();
            expect(() => collection.add(item2)).toThrow();
        });

        test("One components for multiple keys.", (t) => {
            t.arrange();
            let collection = new ComponentsCollection();

            let expected = 1;

            t.act();
            collection.add(expected, Number, Date, String);

            t.assert();
            expect(collection.get(Number)).toBe(expected);
            expect(collection.get(Date)).toBe(expected);
            expect(collection.get(String)).toBe(expected);
            expect(collection.get(Object)).toBeFalsy();
        });
    });

    describe("get", () => {

        test("By type", (t) => {
            t.arrange();
            let collection = new ComponentsCollection();
            let item = 2;

            collection.add(item);

            t.assert();
            expect(collection.get(Number)).toBe(item);
        });

        test("One components by multiple keys.", (t) => {
            t.arrange();
            let collection = new ComponentsCollection();

            let expected = new Number(1);

            collection.add(expected, Number, Date, String);

            t.assert();
            expect(collection.get(Number)).toBe(expected);
            expect(collection.get(Date)).toBe(expected);
            expect(collection.get(String)).toBe(expected);
            expect(collection.get(Object)).toBeFalsy();
        });

        test("No component found - return falsy", (t) => {
            t.arrange();
            let collection = new ComponentsCollection();

            t.act();
            let actual = collection.get(Number);

            t.assert();
            expect(actual).toBeFalsy();
        });
    });

    describe("remove", () => {

        test("Remove a simple component", (t) => {
            t.arrange();
            let collection = new ComponentsCollection();
            let item = 2;

            collection.add(item);

            t.act();
            collection.remove(item);

            t.assert();
            let actual = collection.get(Number);
            expect(actual).toBeFalsy();
        });

        test("Remove component with multiple keys.", (t) => {
            t.arrange();
            let collection = new ComponentsCollection();
            let item = 2;

            collection.add(item, Number, Date);

            t.act();
            collection.remove(item);

            t.assert();
            expect(collection.get(Number)).toBeFalsy();
            expect(collection.get(Date)).toBeFalsy();
        });
    });

    describe("contains", () => {

        test("Input of an existing component, returns true.", (t) => {
            t.arrange();
            let collection = new ComponentsCollection();
            let item = 2;

            collection.add(item);

            t.act();
            let actual: boolean = collection.contains(Number);

            t.assert();
            expect(actual).toBeTruthy();
        });

        test("Input of a component that is not in the collection, returns false.", (t) => {
            t.arrange();
            let collection = new ComponentsCollection();
            let item = 2;

            collection.add(item);

            t.act();
            let actual: boolean = collection.contains(Date);

            t.assert();
            expect(actual).toBeFalsy();
        });
    });

    describe("containsAny", () => {

        test("Input of an existing components, returns true.", (t) => {
            t.arrange();
            let collection = new ComponentsCollection();
            let item = 2;

            collection.add(item);

            t.act();
            let actual: boolean = collection.containsAny([Date, Number]);

            t.assert();
            expect(actual).toBeTruthy();
        });

        test("Input of an unexisting components, returns false.", (t) => {
            t.arrange();
            let collection = new ComponentsCollection();
            let item = 2;

            collection.add(item);

            t.act();
            let actual: boolean = collection.containsAny([Date, String]);

            t.assert();
            expect(actual).toBeFalsy();
        });
    });

    describe("containsAll", () => {

        test("Input of an existing components, returns true.", (t) => {
            t.arrange();
            let collection = new ComponentsCollection();

            collection.add(2);
            collection.add(new Date());

            t.act();
            let actual: boolean = collection.containsAll([Date, Number]);

            t.assert();
            expect(actual).toBeTruthy();
        });

        test("Input of an unexisting components, returns false.", (t) => {
            t.arrange();
            let collection = new ComponentsCollection();
            let item = 2;

            collection.add(item);

            t.act();
            let actual: boolean = collection.containsAll([Date, Number]);

            t.assert();
            expect(actual).toBeFalsy();
        });
    });

    class StaticBody {
        public x: number;
        public y: number;
    }
    class Renderable {
        public posX: number;
        public posY: number;
    }
    class MyPositionComponent {
        public x: number;
        public y: number;

        public get posX() {
            return this.x;
        }

        public get posY() {
            return this.y;
        }
    }
    test("Mixing components.", (t) => {
        t.arrange();
        let collection = new ComponentsCollection();
        let component = new MyPositionComponent();
        component.x = 1;
        component.y = 2;

        collection.add(component, StaticBody, Renderable);

        t.act();
        let body = collection.get(StaticBody);
        let renderable = collection.get(Renderable);

        t.assert();
        expect(body.x).toBe(1);
        expect(body.y).toBe(2);
        expect(renderable.posX).toBe(1);
        expect(renderable.posY).toBe(2);
    });
});