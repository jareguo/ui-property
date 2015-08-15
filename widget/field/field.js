Editor.registerWidget( 'editor-field', {
    is: 'editor-field',

    properties: {
        path: {
            type: String,
            value: '',
        },

        type: {
            type: String,
            value: '',
            // observer: '_typeChanged',
        },

        attrs: {
            type: Object,
            value: function () { return {}; },
            // observer: '_attrsChanged',
        },

        value: {
            value: null,
            notify: true,
            // observer: '_valueChanged',
        },

        slidable: {
            type: Boolean,
            value: false,
            notify: true,
        },

        editing: {
            value: null,
            notify: true,
            reflectToAttribute: true,
        },
    },

    factoryImpl: function ( value, attrs ) {
        this.value = value;
        this.attrs = attrs;
    },

    attached: function () {
        this._rebuild();
    },

    _rebuild: function () {
        if ( this.editing )
            return;

        var thisDOM = Polymer.dom(this);
        var type, propEL;

        if ( thisDOM.firstChild ) {
            thisDOM.removeChild( thisDOM.firstChild );
        }

        if ( this.attrs === undefined || this.type === undefined )
            return;

        if ( this.value === null || this.value === undefined ) {
            type = 'null-or-undefined';
        }

        //
        if ( !type ) {
            if ( this.attrs.type ) {
                type = this.attrs.type;
            }
            else if ( this.type ) {
                type = this.type;
            }
            else {
                type = typeof this.value;
                type = type.charAt(0).toUpperCase() + type.slice(1);
            }

            // check if type error
            if ( this.type && this.attrs.type ) {
                if ( this.type !== this.attrs.type ) {
                    if (this.attrs.extends &&
                        this.attrs.extends.indexOf(type) === -1)
                        {
                            Editor.error( 'Failed to create field %s. Message: type not the same %s:%s', type, this.type, this.attrs.type );
                            propEL = new Editor.properties.error('value and attr has different type');
                        }
                }
            }
        }

        // try to get propCreator
        if ( !propEL ) {
            propCreator = Editor.properties[type];
            if ( !propCreator ) {
                Editor.error( 'Failed to create field %s.', type );
                propEL = new Editor.properties.error('Type not found: ' + type);
            }
        }

        // try to create propEL
        if ( !propEL ) {
            try {
                propEL = propCreator( this, {
                    value: this.value,
                    attrs: this.attrs,
                    type: this.type,
                    path: this.path,
                });
                propEL.readonly = this.attrs.readonly;
            }
            catch ( error ) {
                Editor.error( 'Failed to create field %s. Message: %s', type, error.stack );
                propEL = new Editor.properties.error( 'Element create failed for type: ' + type );
            }
        }

        if ( type === 'Number' || type === 'Float' || type === 'Integer' ) {
            this.set( 'slidable', true );
        }

        //
        thisDOM.appendChild(propEL);
    },

    // _valueChanged: function ( newValue, oldValue ) {
    //     if ( typeof oldValue !== typeof newValue ) {
    //         this._rebuild();
    //         return;
    //     }
    // },

    // _attrsChanged: function ( newValue, oldValue ) {
    //     this._rebuild();
    // },

    // _typeChanged: function () {
    //     this._rebuild();
    // },

});
