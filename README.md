# ng-collection
An Angular collection model to manipulate large datasets.

## Examples

```javascript
angular.module('example', ['ng-collection'])
  .controller('ExampleController', ['Collection', function(Collection) {
  
    // Use an array of objects
    var people = [
      { id: 1, name: 'Jack', age: '45', sex: 'M' },
      { id: 2, name: 'Jill', age: '39', sex: 'F' },
      { id: 3, name: 'Bob', age: '43', sex: 'M' }
    ];
    
    // Add it to a collection
    var collection = new Collection(people);

    // Simple methods
    var count = collection.count() // number of items
    var first = collection.first() // first item in collection
    var last = collection.last() // last item in collection
    var empty = collection.empty() // is list empty (bool)
    
    // Add an item
    collection.push({ id: 4, name: 'Susie', age: '33', sex: 'F' });
    
    // Get the raw list of items
    people = collection.items();
    
    // Aggregation
      // Group collection by a given property; returns an object
      // of Collection objects keyed by the distinct values
      var grouped = collection.groupBy('sex');
      
      // Average collection by a given property; returns the
      // overall average of a given property
      var averages = collection.averageBy('age');
      
      // Count items in collection by values of a given property
      var counts = collection.countBy('sex');
      
      // Sum collection by a given property
      var sums = collection.sumBy('age');
      
      // Fetch the unique values for a given property, returns
      // array of unique values.
      var names = collection.fetchUniqueValues('name');
      
      // Fetch the min/max value of a given property
      var min = collection.min('age');
      var max = collection.max('age');
    
    // Sort items by a property (currently only ascending)
    collection.sortBy('age');
     
    // Get a subset of items from the collection; returns a Collection object
    // Note: subset keeps the original collection in tact, filter does not
    var males = collection.subset(function(val) { return val.sex == 'M'; });
    
    // Pull items from a collection
    // Note: filter removes items from original collection, subset does not
    var females = collection.filter(function(val) { return val.sex == 'F'; });
    
    // Pull item(s) from collection that match a value or list of values for 
    // a given property; this will modify the original collection
    var jack = collection.pullByVal('name', 'Jack'); // returns object or null
    var males = collection.pullByVal('sex', ['M']); // returns Collection possibly empty
    
    // Perform some sort of transformation on each item in the collection
    collection.transform(function(val) {
      val.hairColor = 'Brown';
    });
  }]);
 ```
