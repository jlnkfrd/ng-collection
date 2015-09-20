(function() {
    "use strict";

    /**
     * Common Collection operations, use this if you have an array
     * of objects that you want to perform many operations on
    **/
    angular.module("ngCollection").factory('Collection', function() {

        // Constructure, expects an array of objects
        function Collection(data_array) {
            if (Object.prototype.toString.call(data_array) !== '[object Array]') data_array = [];
            this.raw_data = data_array;
        }

        // Return the total number of elements in the collection
        Collection.prototype.count = function() {
            return this.raw_data.length;
        }

        // Return whether or not the collection is empty
        Collection.prototype.empty = function() {
            return this.count() <= 0;
        }

        // Return the first element in the collection
        Collection.prototype.first = function() {
            return this.empty() ? null : this.raw_data[0];
        }
        
        // Return the raw array of items
        Collection.prototype.items = function() {
            return this.raw_data;
        }

        // Return the last element in the collection
        Collection.prototype.last = function() {
            return this.empty() ? null : this.raw_data[this.raw_data.length - 1];
        }

        // Push a new element to the collection
        Collection.prototype.push = function(new_item) {
            this.raw_data.push(new_item);
            return this;
        }

        // Return the overall Collection average of a given property.
        // Optionally ignore elements where the group property value is
        // equal to zero.
        Collection.prototype.averageBy = function(avg_property, exclude_zeros) {

            if(exclude_zeros) {

                return this.subset(function(v, i, a) {
                    return a[i][avg_property] > 0;
                }).averageBy(avg_property);

            }

            return this.empty() ? 0 : (this.sumBy(avg_property) / this.count());
        }

        // Return an array where the indices correspond to the unique values of
        // the given group property and the values are the number of times that
        // value was found in the original Collection. Optionally ignore elements
        // where the group property value is empty.
        Collection.prototype.countBy = function(group_property, exclude_empty_values) {
            var counts = {};
            var i;
            if (this.empty()) return counts;
            for (i in this.raw_data) {
                if (exclude_empty_values && this.raw_data[i][group_property] == '') continue;
                if (!counts.hasOwnProperty(this.raw_data[i][group_property])) {
                    counts[this.raw_data[i][group_property]] = 0;
                }
                counts[this.raw_data[i][group_property]]++;
            }
            return counts;
        }

        // Return an array of unique values for the given property. Optionally
        // ignore elements where the fetch property value is empty.
        Collection.prototype.fetchUniqueValues = function(fetch_property, exclude_empty_values) {
            return $.map(this.countBy(fetch_property, exclude_empty_values), function (v,i) { return i; });
        }

        // Reduce the current collection to only those items that satisfy the
        // provided closure; function(value, index, array)
        // See .subset to get a subset of items without modifying original instance
        Collection.prototype.filter = function(closure) {
            this.raw_data = this.raw_data.filter(closure);
            return this;
        }

        // Return an array of Collections where the indices correspond to the unique
        // values of the given group property. Optionally ignore elements where the
        // group property value is empty.
        Collection.prototype.groupBy = function(group_property, exclude_empty_values) {
            var sorted = {};
            var i;
            if (this.empty()) return sorted;
            for (i in this.raw_data) {
                if (exclude_empty_values && this.raw_data[i][group_property] == '') continue;
                if (!sorted.hasOwnProperty(this.raw_data[i][group_property])) {
                    sorted[this.raw_data[i][group_property]] = new Collection();
                }
                sorted[this.raw_data[i][group_property]].push(this.raw_data[i]);
            }
            return sorted;
        }
        
        // Find the maximum value of the given property name in the Collection
        Collection.prototype.max = function(property) {
            return Math.max.apply(Math, this.fetchUniqueValues(property));
        }

		// Find the minimum value of the given property name in the Collection
        Collection.prototype.min = function(property) {
            return Math.min.apply(Math, this.fetchUniqueValues(property));
        }
        
        /**
         * Given a property name and a val (or array of vals), pull the item(s)
         * that match the given val(s) for that property from the array.
         * Note: this will remove any matches from the collection
         *
         * TODO: Create a fetchByVal that does something similar but doesn't
         *       modify the collection
         *
         * Returns:
         *   if a single, non-array value is requested and found, that item (object)
         *   if a single, non-array value is requested and not found, null
         *   if an array of values is requested, a Collection is always returned (even if empty)
         **/
        Collection.prototype.pullByVal = function(property, vals) {
            var multiples = vals instanceof Array;
            var result = (multiples ? new Collection() : null);

            if (multiples) {
                var valObj = {}; // make val list an object for quicker searching
                vals.forEach(function(v) { valObj[v] = 1; });
            }

            this.raw_data.forEach(function(v, i, a) {
                if (multiples) {
                    if (valObj.hasOwnProperty(v[property])) {
                        result.push(v);
                        a.splice(i,1);
                    }
                }
                else if (v[property] === vals) {
                    result = v;
                    a.splice(i,1);
                }
            });

            return result;
        }

        // Sort the current collection instance by the given property name
        // Note: this currently always sorts ascending and is case INsensitive
		// TODO: sort descending . . . and case sensitive sorting?
        Collection.prototype.sortBy = function(sort_property) {
            this.raw_data.sort(function(a,b) {
                var A = a[sort_property];
                var B = b[sort_property];
                
                // Make strings lowercase (case insensitive)
                if(isNaN(parseFloat(A)) || !isFinite(A)) {
                    A = A.toLowerCase();
                }
                
                if(isNaN(parseFloat(B)) || !isFinite(B)) {
                    B = B.toLowerCase();
                }

                if (A < B) {
                    return -1
                } else if (A > B) {
                    return 1;
                } else {
                    return 0;
                }
            });

            return this;
        }

        // Find a subset of items based on a given closure; function(value, index, array)
        // subset of items returned as a new Collection instance.
        // Differs from .filter in that it does not modify current instance.
        Collection.prototype.subset = function(closure) {
            return new Collection(this.raw_data.filter(closure));
        }

        // Calculate the sum of all values of the given property name
        // in the collection.
        Collection.prototype.sumBy = function(sum_property) {
            var sum = 0;
            if (this.empty()) return sum;
            var i;
            for (i in this.raw_data) {
                sum = sum + parseFloat(this.raw_data[i][sum_property]);
            }
            return sum;
        }

        // Run provided closure against each element in the collection
        Collection.prototype.transform = function(closure) {
            this.raw_data.forEach(closure);
            return this;
        }

        return Collection;
    });
})();