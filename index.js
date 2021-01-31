var instance_skel = require('../../instance_skel');
require('isomorphic-unfetch')
var debug;
var log;

const stacksQueryGQL = `query stacks {
    stacks {
        id
        label
    }
}`

const executeStackMutationGQL = `mutation executeStack($id: String) {
    executeStack(id: $id)
  }`
function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions

	return self;
}

instance.prototype.updateConfig = function(config) {
	var self = this;

	self.config = config;

	self.actions();
}

instance.prototype.init = function() {
	var self = this;

    self.status(self.STATE_OK);

	debug = self.debug;
	log = self.log;
}

// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;
	return [
		{
			type: 'text',
			id: 'info',
			width: 12,
			label: 'Information',
			value: 'This module provides the ability to execute Stacks on <a href="https://boreal.systems">Boreal Systems Director</>'
		},
		{
			type: 'textinput',
			id: 'core',
			label: 'Director Core URI',
			width: 12
		}
	]
}

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;
	debug("destroy");
}

instance.prototype.actions = function(system) {
    var self = this;
    fetch(`${self.config.core}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
            query: stacksQueryGQL
          })
      })
        .then(r => r.json())
        .then(data => self.stacks = data.data.stacks)
        .then(() =>
            self.setActions({
                'stack': {
                    label: 'Execute Stack',
                    options: [
                        {
                            label: 'Stack',
                            type: 'dropdown',
                            id: 'stack',
                            choices: self.stacks,
                            default: 'false'
                        },
                    ]
                }
            })
        )
}

instance.prototype.action = function(action) {
    var self = this;
    
    console.log(action)

    fetch(`${self.config.core}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
            query: executeStackMutationGQL,
            variables: { id: action.options.stack }
          })
      })
}

instance_skel.extendedBy(instance);
exports = module.exports = instance;
