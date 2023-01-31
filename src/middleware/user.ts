class user {

    private name :string;
    private age  :Uint16Array;
    constructor(name: string, age: Uint16Array){
        this.name = name;
        this.age = age;
    }

    getInfo(){
        return {
            name: this.name,
            age: this.age
        }
    }
}

module.exports = user