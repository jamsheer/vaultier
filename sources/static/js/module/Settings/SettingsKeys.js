Vaultier.SettingsKeysRoute = Ember.Route.extend(
    {
        renderTemplate: function () {
            this.render('SettingsKeys', {outlet: 'Settings'})
        },

        setupController: function (ctrl) {
            ctrl.set('stepInfo', true);
            ctrl.set('stepSuccess', false);
            ctrl.set('stepKeys', false)
        },

        model: function() {
            var chk = this.get('changekey');
            var keys = chk.generateKeys(function(keys) {
                chk.changeKey(keys)
            });



        },

        actions: {
            generate: function () {
                this.set('controller.stepInfo', false);
                this.set('controller.stepKeys', true);
            },

            savePrivateKey: function () {
                // start download
                var raw = this.get('controller.keys.privateKey');
                var blob = new Blob([raw], {type: "text/plain;charset=utf-8"});
                saveAs(blob, "vaultier.key");
                this.set('privateKeySaved', true);
            },


            save: function (keys, result) {
                this.set('controller.keys', keys);
                var promise = Ember.RSVP.resolve()
                    .then(function () {
                        this.set('controller.stepKeys', false);
                        this.set('controller.stepSuccess', true);
                    }.bind(this));

                result.promise = promise
            }
        }

    });


Vaultier.SettingsKeysView = Ember.View.extend({
    templateName: 'Settings/SettingsKeys'
});