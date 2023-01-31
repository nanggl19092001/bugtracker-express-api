"use strict";
class user {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
    getInfo() {
        return {
            name: this.name,
            age: this.age
        };
    }
}
module.exports = user;
