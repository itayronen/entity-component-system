# entity-component-system
Typescript entity-component-system library, that allows modularity.
## Install
`npm install --save-dev entity-component-system`

## Concept
### Component 
A piece of information for an entity on a specific topic.  
> For example, A person entity might have a "HightComponent" that holds a number to represent the person's height.

Components can be used to mark an entity, without having any additional properties.  
> For example, A person entity can hold a "TeacherComponent" to be marked as a teacher.   

### Entity
An object that holds components.

### System
Contains logic that acts on entities, using the entities components.

### In this library  
Every class can be a component, from a number to a complex class.

A component is usualy identified by its class. To be more exact, his constructor function (well thats javascript).
> A component can also be referenced by other constructors. See the advanced section.
The library uses the ComponentCollection to hold the entity's components.


## Basic Usage
### ComponentCollection
```ts
let collection = new ComponentsCollection();
let component = 1; // Component of type Number.

collection.add(component);

let myNumber: number = collection.get(Number);
```

### EntitiesCollection

```ts
// Some example entity
class TankEntity implements IEntity {
    public components: ComponentsCollection = new ComponentsCollection();

    constructor() {
        this.components.add(new GunsComponent());
    }
}

// Some example component
class GunsComponent {
    public power: number = 1;

    constructor(power?: number) {
        if (power) {
            this.power = power;
        }
    }
}

// Using EntitiesCollection
let entities = new EntitiesCollection();
let tank = new TankEntity();

entities.add(tank);

let myShootingEntities: IEntity[] = collection.getByComponent(GunsComponent);
console.log(myShootingEntities.length); // 1
```

### Systems
TODO

## Advanced Usage
### Shared Components
Usualy a component is tailor made for a specific system.  
That raises some common problems:
* Sharing information between systems is hard, and might cause **coupling**.
* Mixing third-party libraries very is hard.  

> For example, an entity "PositionComponent" is used by the physics-system and by the render-system.

This library offers a simple solution: Multiple component keys.

Given the classes:

```ts
class StaticBodyComponent {
    public x: number;
    public y: number;
}

class RenderablePositionComponent {
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
```
We can:

```ts
let collection = new ComponentsCollection();
let myComponent = new MyPositionComponent();
myComponent.x = 1;
myComponent.y = 2;

collection.add(myComponent, StaticBodyComponent, RenderablePositionComponent);
// Or: collection.add(myComponent, [StaticBodyComponent, RenderablePositionComponent]);

let staticBody = collection.get(StaticBodyComponent); // x: 1, y: 2
let renderable = collection.get(RenderablePositionComponent); // posX: 1, posY: 2
```

### Observe entities
TODO
