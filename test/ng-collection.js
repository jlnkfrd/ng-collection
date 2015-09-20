/**
 * Unit tests for ng-collection.js
 **/

describe("The Collection model", function() {
    
    var Collection;
    
	beforeEach(angular.mock.module('ng-collection'));

	beforeEach(inject(function(_Collection_) {
		Collection = _Collection_;
    }));

    /**
     * These first 2 tests really test several simple methods:
     *  - constructor, count, empty, first, items, last
     **/
    it('initializes a collection with an empty array when not passed any arguments', function() {
        var collection = new Collection;
        expect(collection.count()).toBe(0);
        expect(collection.empty()).toBe(true);
        expect(collection.first()).toBeNull();
        expect(collection.items()).toEqual([]);
        expect(collection.last()).toBeNull();
    });
    
    it('initializes a collection with the provided array', function() {
        var collection = new Collection(['foo', 'bar']);
        expect(collection.count()).toBe(2);
        expect(collection.empty()).toBe(false);
        expect(collection.first()).toBe('foo');
        expect(collection.items()).toEqual(['foo', 'bar']);
        expect(collection.last()).toBe('bar');
    });
    
    /**
     * Test push capability
     **/
    it('pushes a value to the collection', function() {
        var collection = new Collection(['foo']);
        collection.push('bar');
        expect(collection.count()).toBe(2);
        expect(collection.items()).toEqual(['foo','bar']);
    });

    /**
     * Test averageBy capability
     **/
    it('averages by a given property', function() {
        var collection = new Collection([
            { foo: 3, bar: 20.34 },
            { foo: 6, bar: 15.22 },
            { foo: 9, bar: 22.15 }
        ]);

        expect(collection.averageBy('foo')).toBe((3 + 6 + 9) / 3);
        expect(collection.averageBy('bar')).toBe((20.34 + 15.22 + 22.15) / 3);
    });

     /**
     * Test averageBy capability disregarding Zero values
     **/
     it('averages by a given property excluding zeros', function() {
        var collection = new Collection([
            { foo: 7,  bar: 12.34 },
            { foo: 11, bar: 0.00 },
            { foo: 0,  bar: 21.12 },
            { foo: 24, bar: 0.00 },
            { foo: 9,  bar: 7.21 },
            { foo: 0,  bar: 0.00 }
        ]);

        expect(collection.averageBy('foo', true)).toBe((7 + 11 + 24 + 9) / 4);
        expect(collection.averageBy('bar', true)).toBe((12.34 + 21.12 + 7.21) / 3);

        expect(collection.averageBy('foo', false)).toBe((7 + 11 + 24 + 9) / 6);
        expect(collection.averageBy('bar', false)).toBe((12.34 + 21.12 + 7.21) / 6);

    });


    /**
     * Test countBy capability
     **/
    it('determines counts based on distinct property values', function() {
        var collection = new Collection([
            { animal: 'dog', name: 'Lucky' },
            { animal: 'cat', name: 'snowball' },
            { animal: 'dog', name: 'lucky' },
            { animal: 'horse', name: 'ed' },
            { animal: 'horse', name: ''}
        ]);

        var byAnimal = collection.countBy('animal');
        var byName = collection.countBy('name');

        expect(byAnimal['dog']).toBe(2);
        expect(byAnimal['cat']).toBe(1);
        expect(byAnimal['horse']).toBe(2);
        expect(byName['snowball']).toBe(1);
        expect(byName['Lucky']).toBe(1);    // Count IS case sensitive
        expect(byName['']).toBe(1);         // We should be including emptys here
    });
    
    it('determines counts and excludes empty values when requested', function() {
        var collection = new Collection([
            { animal: 'dog', name: 'Lucky' },
            { animal: 'cat', name: 'snowball' },
            { animal: 'dog', name: 'lucky' },
            { animal: 'horse', name: 'ed' },
            { animal: 'horse', name: ''}
        ]);

        var byName = collection.countBy('name', true);

        expect(byName['snowball']).toBe(1);
        expect(byName['Lucky']).toBe(1);    // Count IS case sensitive
        expect(byName['']).toBeUndefined(); // We should be excluding emptys here
    });

    /**
     * Test fetchUniqueValues capability
     **/
    it('fetches unique/distinct values for a given property', function() {
        var collection = new Collection([
            { animal: 'dog', name: 'Lucky' },
            { animal: 'cat', name: 'snowball' },
            { animal: 'dog', name: 'lucky' },
            { animal: 'horse', name: 'ed' }
        ]);

        var animals = collection.fetchUniqueValues('animal');
        var names = collection.fetchUniqueValues('name');

        expect(animals).toEqual(['dog','cat','horse']);
        expect(names).toEqual(['Lucky','snowball','lucky','ed']);
    });
    
    /**
     * Test filter capability
     **/
    it('reduces the array based on the closure', function() {
        var collection = new Collection([
            { foo: 12, bar: 20.34 },
            { foo: 3, bar: 15.22 },
            { foo: 9, bar: 22.15 }
        ]);

        collection.filter(function(v, i, a) { return a[i]['foo'] < 10; });
        
        expect(collection.count()).toBe(2);
        expect(collection.items()).toEqual([{ foo: 3, bar: 15.22 }, { foo: 9, bar: 22.15 }]);
    });
    
    /**
     * Test groupBy capability
     **/
    it('groups items based on distinct property values', function() {
        var collection = new Collection([
            { animal: 'dog', name: 'Lucky' },
            { animal: 'cat', name: 'snowball' },
            { animal: 'dog', name: 'lucky' },
            { animal: 'horse', name: 'ed' },
            { animal: 'horse', name: ''}
        ]);

        var byAnimal = collection.groupBy('animal');
        var byName = collection.groupBy('name');

        expect(byAnimal['dog'].count()).toBe(2);
        expect(byAnimal['cat'].count()).toBe(1);
        expect(byAnimal['horse'].count()).toBe(2);
        expect(byName['snowball'].count()).toBe(1);
        expect(byName['Lucky'].count()).toBe(1);    // Count IS case sensitive
        expect(byName[''].count()).toBe(1);         // We are including emptys here
    });
    
    it('determines counts and excludes empty values when requested', function() {
        var collection = new Collection([
            { animal: 'dog', name: 'Lucky' },
            { animal: 'cat', name: 'snowball' },
            { animal: 'dog', name: 'lucky' },
            { animal: 'horse', name: 'ed' },
            { animal: 'horse', name: ''}
        ]);

        var byName = collection.groupBy('name', true);

        expect(byName['snowball'].count()).toBe(1);
        expect(byName['Lucky'].count()).toBe(1);    // Count IS case sensitive
        expect(byName['']).toBeUndefined();         // We are including emptys here
    });
    
    /**
     * Test max capability
     **/
    it('finds max value for a given property', function() {
        Collection.prototype.fetchUniqueValues = jasmine.createSpy("fetchUniqueValues spy").and.returnValue([3,9,12]);
        var collection = new Collection([
            { foo: 12, bar: 20.34 },
            { foo: 3, bar: 15.22 },
            { foo: 9, bar: 22.15 }
        ]);

        expect(collection.max('foo')).toBe(12);
    });

    /**
     * Test min capability
     **/
    it('finds min value for a given property', function() {
        Collection.prototype.fetchUniqueValues = jasmine.createSpy("fetchUniqueValues spy").and.returnValue([3,9,12]);
        var collection = new Collection([
            { foo: 12, bar: 20.34 },
            { foo: 3, bar: 15.22 },
            { foo: 9, bar: 22.15 }
        ]);

        expect(collection.min('foo')).toBe(3);
    });

    /**
     * Test pullByVal capability
     **/
    it('pulls an item from the Collection based on a specified property value', function() {
        var collection = new Collection([
            { foo: 12, bar: 20.34 },
            { foo: 3, bar: 15.22 },
            { foo: 9, bar: 22.15 }
        ]);

        var pulled = collection.pullByVal('foo', 12);
        
        expect(collection.items()).toEqual([{foo:3,bar:15.22},{foo:9,bar:22.15}]);
        expect(pulled).toEqual({foo:12,bar:20.34});
    });
    
    it('pulls a collection of items from the collection based on an array of property values', function() {
        var collection = new Collection([
            { foo: 12, bar: 20.34 },
            { foo: 3, bar: 15.22 },
            { foo: 9, bar: 22.15 }
        ]);

        var pulled = collection.pullByVal('foo', [12,9,10]);
        
        expect(collection.items()).toEqual([{foo:3,bar:15.22}]);
        expect(pulled.items()).toEqual([{foo:12,bar:20.34},{foo:9,bar:22.15}]);
    });
    
    it('does nothing if requested to pull an item not in the collection', function() {
        var collection = new Collection([
            { foo: 12, bar: 20.34 },
            { foo: 3, bar: 15.22 },
            { foo: 9, bar: 22.15 }
        ]);

        var pulled = collection.pullByVal('bar', 123.45);
        
        expect(collection.items()).toEqual([{foo:12,bar:20.34},{foo:3,bar:15.22},{foo:9,bar:22.15}]);
        expect(pulled).toBeNull();
    });
    
    it('always returns a collection when an array of pull values is provided', function() {
        var collection = new Collection([
            { foo: 12, bar: 20.34 },
            { foo: 3, bar: 15.22 },
            { foo: 9, bar: 22.15 }
        ]);

        var pulled = collection.pullByVal('bar', [123.45, 234.56]);
        
        expect(collection.items()).toEqual([{foo:12,bar:20.34},{foo:3,bar:15.22},{foo:9,bar:22.15}]);
        expect(pulled.count()).toBe(0);
    });

    /**
     * Test sortBy capability
     **/
    it('sorts by a given property numerically', function() {
        var collection = new Collection([
            { foo: 12, bar: 20.34 },
            { foo: 3, bar: 15.22 },
            { foo: 9, bar: 22.15 }
        ]);

        collection.sortBy('foo');

        expect(collection.first().foo).toBe(3);
        expect(collection.last().foo).toBe(12);
    });

    it('sorts by a given property alphabetically', function() {
        var collection = new Collection([
            { animal: 'dog', name: 'Lucky' },
            { animal: 'cat', name: 'snowball' },
            { animal: 'horse', name: 'ed' },
            { animal: 'horse', name: ''},
            { animal: 'dog', name: 'lucky' }
        ]);

        collection.sortBy('animal');

        expect(collection.first().animal).toBe('cat');
        expect(collection.last().animal).toBe('horse');
    });
    
    /**
     * Test subset capability
     **/
    it('returns a subset of items as a new Collection', function() {
        var collection = new Collection([
            { foo: 12, bar: 20.34 },
            { foo: 3, bar: 15.22 },
            { foo: 9, bar: 22.15 }
        ]);

        var subset = collection.subset(function(v, i, a) { return a[i]['foo'] < 10; });

        expect(typeof subset).toBe('object');
        expect(subset.constructor).toBe(Collection);
    });

    it('returns the correct subset of items', function() {
        var collection = new Collection([
            { foo: 12, bar: 20.34 },
            { foo: 3, bar: 15.22 },
            { foo: 9, bar: 22.15 }
        ]);

        var subset = collection.subset(function(v, i, a) { return a[i]['foo'] < 10; });
        
        expect(subset.count()).toBe(2);
        expect(subset.items()).toEqual([{ foo: 3, bar: 15.22 }, { foo: 9, bar: 22.15 }]);
    });

    /**
     * Test sumBy capability
     **/
    it('sums by a given property', function() {
        var collection = new Collection([
            { foo: 12, bar: 20.34 },
            { foo: 3, bar: 15.22 },
            { foo: 9, bar: 22.15 }
        ]);

        expect(collection.sumBy('foo')).toBe(12+3+9);
        expect(collection.sumBy('bar')).toBe(20.34+15.22+22.15);
    });

    /**
     * Test transform capability
     **/
    it('transforms the given Collection using provided closure', function() {
        var collection = new Collection([
            { foo: 12, bar: 20.34 },
            { foo: 3, bar: 15.22 },
            { foo: 9, bar: 22.15 }
        ]);

        var transformed = collection.transform(function(value, index, array) {
            value.foo = 'bar';
        });

        expect(transformed.first().foo).toBe('bar');
        expect(transformed.last().foo).toBe('bar');
    });
});