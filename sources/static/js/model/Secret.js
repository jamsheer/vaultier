Vaultier.Secret = RL.Model.extend(
    Vaultier.CreatedUpdatedMixin,
    Vaultier.RollbackMixin,
    {

        init: function () {
            this.set('workspacekey', Vaultier.__container__.lookup('service:workspacekey'))
            return this._super.apply(this, arguments);
        },

        /**
         * @DI service:workspacekey
         */
        workspacekey: null,


        types: new Utils.ConstantList({
            'NOTE': {
                value: 100,
                text: 'NOTE'
            },
            'PASSWORD': {
                value: 200,
                text: 'PASSWORD'
            },
            'FILE': {
                value: 300,
                text: 'FILE'
            }
        }),


        name: RL.attr('string'),
        type: RL.attr('number'),
        data: RL.attr('string'),
        card: RL.attr('number'),
        perms: RL.attr('object'),

        decoded: false,

        password: null,
        username: null,
        url: null,
        note: null,
        file: null,

        isNote: function () {
            return this.get('type') == this.types['NOTE'].value;
        }.property('type'),

        isPassword: function () {
            return this.get('type') == this.types['PASSWORD'].value;
        }.property('type'),

        isFile: function () {
            return this.get('type') == this.types['FILE'].value;
        }.property('type'),

        deferDecode: function () {
            var workspacekey = this.get('workspacekey');
            workspacekey.one('keyTransfered', function () {
                this.decode();
            }.bind(this))
        },

        decode: function () {
            var workspacekey = this.get('workspacekey');

            var data = this.get('data');
            try {
                data = workspacekey.decryptWorkspaceData(data)
                this.set('decoded', true);
            } catch (e) {
                this.set('decoded', false);
                if (e instanceof Service.WorkspaceKeyDecryptSoftError) {
                    console.warn(e.stack);
                    this.deferDecode();
                } else {
                    console.error('Cannot decode');
                    console.error(e.stack);
                }
            }
            this.setProperties(data);
        },

        applyMixinByType: function () {
            var type = this.get('type');
            var clsName = 'Vaultier.Secret' + this.types.getKeyByValue(type) + 'Mixin';
            var cls = Ember.get(clsName);
            if (!cls)
                throw new Error('Cannot instantiate secret class mixin {mixin} for type {type}'
                    .replace('{tyoe}', type)
                    .replace('{mixin}', clsName))
            cls.apply(this);
        },

        deserialize: function (data) {
            this._super.apply(this, [data]);
            this.applyMixinByType()
            return this;
        },

        encode: function () {
            var data;
            switch (this.get('type')) {

                case this.types['NOTE'].value:
                {
                    data = this.getProperties('note');
                    break;
                }
                case this.types['PASSWORD'].value:
                {
                    data = this.getProperties('password', 'url', 'note', 'username');
                    break;
                }
                case this.types['FILE'].value:
                {
                    data = this.getProperties('file', 'url', 'note', 'username');
                    break;
                }
                default:
                {
                    throw 'Unspecified secret type cannot be encoded';
                }

            }

            data = this.get('workspacekey').encryptWorkspaceData(data)
            this.set('data', data);

        },

        didLoad: function () {
            this.decode();
            return this._super();
        },

        didReload: function () {
            this.decode();
            return this._super();
        },

        saveRecord: function () {
            this.encode();
            return this._super.apply(this, arguments);
        }

    });

Vaultier.SecretFILEMixin = Ember.Mixin.create({

})

Vaultier.SecretNOTEMixin = Ember.Mixin.create({
})

Vaultier.SecretPASSWORD = Ember.Mixin.create({
})


