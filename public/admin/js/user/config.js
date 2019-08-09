import edit_button from '../edit_button.html';

export default function (nga, admin) {
	var user = admin.getEntity('Users');
	user.listView()
		.title('<h4>Users <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
		.batchActions([])
        .actions(['<roles post="entry"></roles>', 'filter', 'export','create','<invite type="invite_users" selection="selection"></invite>'])
		.fields([
			nga.field('group_id', 'reference')
				.targetEntity(admin.getEntity('Groups'))
                .targetField(nga.field('name'))
				.label('Group'),
			nga.field('company_id', 'reference')
					.targetEntity(admin.getEntity('Settings'))
					.targetField(nga.field('company_name'))
					.attributes({ placeholder: 'Choose company from dropdown list' })
					.perPage(-1)
					.label('Company'),
			nga.field('username', 'string')
				.label('Username'),
			nga.field('email', 'email')
				.cssClasses('hidden-xs')
				.label('Email'),
			nga.field('telephone', 'string')
				.cssClasses('hidden-xs')
				.label('Telephone'),
            nga.field('last_login_ip', 'string')
                .map(function truncate(value) {
                    if (!value) {
                        return '';
                    }
                    return value.length > 14 ? value.substr(0, 14) + '...' : value;
                })
                .label('Last Login IP'),
			nga.field('isavailable','boolean')
				.label('Is Available'),
		])
        .filters([
            nga.field('q')
                .label('')
                .template('<div class="input-group"><input type="text" ng-model="value" placeholder="Search" class="form-control"><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span></div>')
                .pinned(true),
            nga.field('group_id', 'reference')
                .targetEntity(admin.getEntity('Groups'))
                .targetField(nga.field('name'))
                .label('Group'),
		])
		.listActions(['edit'])
        .exportFields([
         user.listView().fields(),
        ]);


	user.creationView() 
		.title('<h4>Users <i class="fa fa-angle-right" aria-hidden="true"></i> Create: User </h4>')          
		.fields([
			nga.field('group_id', 'reference')
				.targetEntity(admin.getEntity('Groups'))
                .targetField(nga.field('name'))
                .validation({validator: function(value) {
                        if(value === null || value === ''){
                            throw new Error('Please Select Group');
                        }
                    }
                })
				.permanentFilters({exclude_group: 'superadmin'})
                .attributes({ placeholder: 'Select group' })
				.label('Group *'),
			nga.field('company_id', 'reference')
					.targetEntity(admin.getEntity('Settings'))
					.targetField(nga.field('company_name'))
					.attributes({ placeholder: 'Choose company from dropdown list' })
					.perPage(-1)
					.label('Company'),
			nga.field('username', 'string')
				.attributes({ placeholder: 'Username must be at least 3 character long' })
				.validation({ required: true, minlength: 3 })
				.label('Username'),
			nga.field('hashedpassword', 'password')
				.attributes({ placeholder: 'Password must be at least 4 character long' })
				.validation({ required: true, minlength: 4})
				.label('Password'),
			nga.field('email', 'email')
				.attributes({ placeholder: 'Email' })
				.validation({ required: true })
				.label('Email'),
			nga.field('telephone', 'string')
				.attributes({ placeholder: 'Telephone' })
				.validation({ required: true })
				.label('Telephone'),
            nga.field('jwtoken', 'string')
                .attributes({ placeholder: 'Api Key', readOnly: true })
				.defaultValue('')
                .label('Api Key'),
			nga.field('template')
                .label('')
                .template('<generate post="entry"></generate>'),
			nga.field('isavailable', 'boolean')
				.validation({ required: true })
				.label('Is Available'),
            nga.field('template')
            	.label('')
            	.template(edit_button),
            //hidden from UI
            nga.field('third_party_api_token', 'string')
                .cssClasses('hidden')
                .attributes({ placeholder: 'Third party token' })
                .defaultValue('')
                .label(''),
		])


    user.editionView()
    	.title('<h4>Users <i class="fa fa-angle-right" aria-hidden="true"></i> Edit: {{ entry.values.username }}</h4>')  
    	.actions(['list'])         
        .fields([
			nga.field('group_id', 'reference')
					.targetEntity(admin.getEntity('Groups'))
					.targetField(nga.field('name'))
					.validation({validator: function(value) {
						if(value === null || value === ''){
							throw new Error('Please Select Group');
						}
					}
					})
					.permanentFilters({exclude_group: 'superadmin'})
					.attributes({ placeholder: 'Select group' })
					.label('Group *'),
			nga.field('username', 'string')
					.attributes({ placeholder: 'Username must be at least 3 character long' })
					.validation({ required: true, minlength: 3 })
					.label('Username'),
			nga.field('hashedpassword', 'password')
					.attributes({ placeholder: 'Password must be at least 4 character long' })
					.validation({ required: true, minlength: 4})
					.label('Password'),
			nga.field('email', 'email')
					.attributes({ placeholder: 'Email' })
					.validation({ required: true })
					.label('Email'),
			nga.field('telephone', 'string')
					.attributes({ placeholder: 'Telephone' })
					.validation({ required: true })
					.label('Telephone'),
			nga.field('jwtoken', 'string')
					.attributes({ placeholder: 'Api Key', readOnly: true })
					.defaultValue('')
					.label('Api Key'),
			nga.field('template')
					.label('')
					.template('<generate post="entry"></generate>'),
			nga.field('isavailable', 'boolean')
					.validation({ required: true })
					.label('Is Available'),
			nga.field('template')
					.label('')
					.template(edit_button),
			//hidden from UI
			nga.field('third_party_api_token', 'string')
					.cssClasses('hidden')
					.attributes({ placeholder: 'Third party token' })
					.defaultValue('')
					.label(''),
        ]);

	return user;
	
}