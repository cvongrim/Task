var App = new Ext.Application({
		name : 'TaskApp',
		useLoadMask : true,
		launch : function () {
			
			// Task Data Structure
			Ext.regModel('Task', {
				idProperty: 'id',
				fields: [
					{ name: 'id', type: 'int' },
					{ name: 'date', type: 'date', dateFormat: 'c'},
					{ name: 'title', type: 'string'},
					{ name: 'description', type: 'string' },
					{ name: 'completed', type: 'boolean' } 
				],
				validations: [
					{ type: 'presence', field: 'id' },
					{ type: 'presence', field: 'title', message: 'Please enter a title for this note.' }
				]
			});
			
			// Save the Data Structure Locally
			Ext.regStore('TaskStore', {
				model: 'Task',
				sorters: [{
						property: 'date',
						direction: 'DESC'
				}],
				proxy: {
					type: 'localstorage',
					id: 'task-app-store'
				},
				data: [
				{ id: 1, date: new Date(), title: 'Your First Task', description: 'Your very first task' }
				]
			});
			
			// Task Editor Top Toolbar
			TaskApp.views.taskEditorTopToolbar = new Ext.Toolbar({
				title: 'Edit Task',
				items: [
					{
							text: 'Home',
							ui: 'back',
							handler: function(){
								TaskApp.views.viewport.setActiveItem('taskListContainer', {type: 'slide', direction: 'right' });
							
							}
					},
					{ xtype: 'spacer' },
					{
						text: 'Save',
						ui: 'action',
						handler: function(){
							// Save Current Task
							var taskEditor = TaskApp.views.taskEditor;
							var currentTask = taskEditor.getRecord();
							
							//Update the task with the values in the form
							taskEditor.updateRecord(currentTask);
							
							var errors = currentTask.validate();
							
							if(!errors.isValid()){
								currentTask.reject();
								Ext.Msg.alert('Wait!', errors.getByField('title')[0].message, Ext.emptyFn);
								return;
							}
							
							var taskList = TaskApp.views.taskList;
							var taskStore = taskList.getStore();
							
							if(taskStore.findRecord('id', currentTask.data.id) === null ){
								taskStore.add(currentTask);
							} else {
								currentTask.setDirty();
							}
							
							taskStore.sync();
							taskStore.sort([{ property: 'date', direction: 'DESC'}]);
							
							taskList.refresh();
							
							TaskApp.views.viewport.setActiveItem('taskListContainer', {type: 'slide', direction: 'right' });
						}
					}
				]
			});
			
			
			
			// Task Editor Bottom Toolbar
			TaskApp.views.taskEditorBottomToolbar = new Ext.Toolbar({
    			dock: 'bottom',
    			items: [
        			{ xtype: 'spacer' },
        			{
          			  iconCls: 'trash',
            		  iconMask: true,
           			  handler: function () {
                			var currentTask = TaskApp.views.taskEditor.getRecord();
							var taskList = TaskApp.views.taskList;
							var taskStore = taskList.getStore();
							
							if(taskStore.findRecord('id', currentTask.data.id)){
								taskStore.remove(currentTask);
							}
							
							taskStore.sync();
							
							taskList.refresh();
							TaskApp.views.viewport.setActiveItem('taskListContainer', { type: 'slide', direction: 'right'});
            			}
       				}
    			]
			});
			
			
			// Create the Form Panel For Adding/Edditing Task
			TaskApp.views.taskEditor = new Ext.form.FormPanel({
				id: 'taskEditor',
				items: [
					{
						xtype: 'textfield',
						name: 'title',
						label: 'Title',
						required: true
					},
					{
						xtype: 'textareafield',
						name: 'description',
						label: 'Description'
					}
				],
				dockedItems: [
					TaskApp.views.taskEditorTopToolbar,
					TaskApp.views.taskEditorBottomToolbar
					]
			});
			
			// Create the Task List
			TaskApp.views.taskList = new Ext.List({
				id: 'taskList',
				store: 'TaskStore',
				itemTpl: '<div class="task-item-title">{title}</div>'+ 
						 '<div class="list-item-description">{description}</div>',
				onItemDisclosure: function(record){
					var selectedTask = record;
					TaskApp.views.taskEditor.load(selectedTask);
					TaskApp.views.viewport.setActiveItem('taskEditor', { type: 'slide', direction: 'left'});
				},
				itemTpl: '<div class="list-item-title">{title}</div>'+
						 '<div class="list-item-description">{description}</div>',
				listeners: {
						'render' : function (thisComponent) {
							thisComponent.getStore().load();
						}
					
				}
			});
			
			// Create Tool Bar
			TaskApp.views.taskListToolbar = new Ext.Toolbar({
				id: 'taskListToolbar',
				title: 'My Task',
				layout: 'hbox',
				items: [
					{
							id: 'aboutApp',
							text: 'About',
							ui: 'action',
							handler: function(){
								TaskApp.views.viewport.setActiveItem('aboutAppContainer', { type: 'slide', direction: 'right'});
							}
					},
					{ xtype: 'spacer' },
					{
							id: 'newTaskButton',
							text: 'New',
							ui: 'action',
							handler: function(){
								
								var now = new Date();
								var taskId = now.getTime();
								var task = Ext.ModelMgr.create(
									{ id: taskId, date: now, title: '', description: ''},
									'Task'
									);
									
									TaskApp.views.taskEditor.load(task);
									TaskApp.views.viewport.setActiveItem('taskEditor', { type: 'slide', direction: 'left'});								
							}
					}
				]
			});
			
			
			// Create the viewport
			TaskApp.views.taskListContainer = new Ext.Panel({
					id: 'taskListContainer',
					layout: 'fit',
					html: 'This is the Task List Container',
					dockedItems: [TaskApp.views.taskListToolbar],
					items: [TaskApp.views.taskList]
			});
			
			// Task Editor Top Toolbar
			TaskApp.views.aboutAppTopToolbar = new Ext.Toolbar({
				title: 'About App',
				items: [
					{
							text: 'Home',
							ui: 'back',
							handler: function(){
								TaskApp.views.viewport.setActiveItem('taskListContainer', {type: 'slide', direction: 'left' });
							
							}
					},
					{ xtype: 'spacer' }
				]
			});
			
			
			// Create the About App viewport
			TaskApp.views.aboutAppContainer = new Ext.Panel({
					id: 'aboutAppContainer',
					layout: 'fit',
					html: '<h1>The Task App</h1><br />'+
						  '<p>This is a simple app created to make a to do list.  This project is a work in progress.  New features will be added constantly.</p><br />'+
						  '<p>Created by Colin von Grimmenstein</p>	',
					dockedItems: [TaskApp.views.aboutAppTopToolbar]
			});
			
			
			// Create the Viewport that Holds the list container
			TaskApp.views.viewport = new Ext.Panel({
				fullscreen : true,
				layout : 'card',
				card : 'slide',
				items: [
					TaskApp.views.taskListContainer,
					TaskApp.views.taskEditor,
					TaskApp.views.aboutAppContainer
				]
				
			});
			
				
		}
})