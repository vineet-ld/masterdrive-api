/*
* class representing an interface.
* DO NOT create instances of Drive class.
* USE factory methods to create appropriate drive instances
* */
class Drive {

    /*
    * Abstract method. Needs to be implemented in sub-clases
    * */
    getAuthenticationUrl() {
        throw new Error("Cannot make a call to the abstract method. Method needs to be implemented");
    }

    /*
    * Abstract method. Needs to be implemented in sub-clases
    * */
    getToken(code) {
        throw new Error("Cannot make a call to the abstract method. Method needs to be implemented");
    }

}

module.exports = Drive;