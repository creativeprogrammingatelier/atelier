# models
To unify data types being used in the entire project, models were used.
These models contain the structure of certain objects, such as courses or users.
### API models
All models that are used to communicate with the api, can be found in [/models/api]. 
Notable is the references object, which exists on some of these models. 
It contains identifying information for 'parent' objects.  (e.g. comments contain a reference to the course they are made in)

### database models
The database models, found in [/models/database] contain 2 types of models:
first they contain models that the database functions use as input. 
An important characteristic of those is that all fields are optional. 
This allows for flexible functions that can be reused for different purposes.
All these input models also allow for some generic optional parameters to be passed in, such as a limit.
More over those parameters can be found here: [/docs/databaseNotes.md]

The second type of models found here contain the return types the database gives back directly.
They are only used within the database functions themselves.
These files also contain a conversion method that converts the raw database data to an API model.
This function is used within the database functions to create an API model.

### enums
this project sometimes makes use of string enums. 
```typescript
	enum EnumName {
		key1: "key1",
		anotherKey: "anotherKey"
		...
	}
	const value = EnumName["key1"]
	if (value in EnumName){
		console.log("all OK. value is part of the enum")
	} else {
		console.log("input value is not part of the enum")
	}
```
These allow for runtime enum checking, repeatedly. 
Since the values are always strings, conversion between these types is easy.
