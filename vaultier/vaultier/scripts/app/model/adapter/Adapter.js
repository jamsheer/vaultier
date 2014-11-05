RL.Model.reopenClass({
    adapter: Ember.computed(function () {
        var resourceName = Ember.get(this, 'resourceName');
        var serviceName = 'adapter:' + resourceName.toLowerCase();
        var service = Vaultier.__container__.lookup(serviceName);
        if (!service) {
            throw new Error("Cannot find adapter for model '{rn}' as service '{sn}'".replace('{rn}', resourceName).replace('{sn}', serviceName));
        }
        return service;
    })
})

ApplicationKernel.namespace('Vaultier.dal.adapter');

Vaultier.dal.adapter.JSONSerializer = RESTless.JSONSerializer.extend({
    // Vaultier posts are native jsons without root
    serialize: function (resource, options) {
        options = options || {};
        options.nonEmbedded = true;
        return this._super.apply(this, [resource, options]);
    },

    keyForResourceName: function (name) {
        return name
    },

    // Vaultier does not use camelizations
    attributeNameForKey: function (klass, key) {
        return key;
    }
});


ApplicationKernel.namespace('Vaultier.dal.adapter');

//@todo: basic adapter
Vaultier.dal.adapter.RESTAdapter = RL.RESTAdapter.extend({
    url: '/',
    namespace: 'api',

    serializer: Vaultier.dal.adapter.JSONSerializer.create(),

    buildUrl: function (model, key) {
        var resourcePath = this.resourcePath(Ember.get(model.constructor, 'resourceName'));
        var resourceListFormat = Ember.get(model.constructor, 'resourceListFormat');
        var resourceDetailFormat = Ember.get(model.constructor, 'resourceDetailFormat');
        var resourceFormat
        var rootPath = this.get('rootPath');
        var primaryKeyName = Ember.get(model.constructor, 'primaryKey');
        var dataType = ''
        var url;
        var id = '';

        if (key) {
            id = key;
        } else if (model.get(primaryKeyName)) {
            id = model.get(primaryKeyName);
        }

        if (this.get('useContentTypeExtension') && dataType) {
            var dataType = this.get('serializer.dataType');
        }

        if (!resourceListFormat) {
            resourceListFormat = '{rootPath}/{resourcePath}/{dataType}'
        }

        if (!resourceDetailFormat) {
            resourceDetailFormat = '{rootPath}/{resourcePath}/{id}/{dataType}'
        }

        resourceFormat = id ? resourceDetailFormat : resourceListFormat

        var url = resourceFormat
            .replace('{rootPath}', rootPath)
            .replace('{resourcePath}', resourcePath)
            .replace('{id}', id)
            .replace('{dataType}', dataType)

        return url;
    }
});

ApplicationKernel.namespace('Vaultier.dal.adapter.fields');

//@todo: move to fields directory to specify own fields
Vaultier.dal.adapter.fields.Object = Ember.Mixin.create({
    init: function () {
        this.registerTransform('object', {
            deserialize: function (native) {
                return native;
            },
            serialize: function (deserialized) {
                return deserialized
            }
        })
    }
});


Vaultier.Client = RL.Client.create({
    createRecord: function (cls, data) {
        return Vaultier[cls].create(data);
    },

    find: function () {
        var model = arguments[0];
        var params = arguments[1];
        //@todo: retrieve adapter from container, use fetch method of adapetr
        return Vaultier[model].fetch(params)
    }

});


Vaultier.initializer({
    name: 'adapters',

    initialize: function (container, app) {

        // example of mocking
        var MockAdapter = Vaultier.dal.model.news.Adapter.extend({
            find: function () {
                // return mocked empty content
                return RESTless.RecordArray.createWithContent();
            }
        });


        app.register('adapter:user', Vaultier.dal.adapter.RESTAdapter);
        app.register('adapter:workspace', Vaultier.dal.adapter.RESTAdapter);
        app.register('adapter:workspacekey', Vaultier.dal.adapter.RESTAdapter);
        app.register('adapter:role', Vaultier.dal.adapter.RESTAdapter);
        app.register('adapter:vault', Vaultier.dal.adapter.RESTAdapter);
        app.register('adapter:news', Vaultier.dal.model.news.Adapter);
        // reregister mock adapter
        app.register('adapter:news', MockAdapter);

    }
});



