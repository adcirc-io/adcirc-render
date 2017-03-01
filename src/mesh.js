function mesh () {

    var _nodes = { array: [], map: d3.map() };
    var _elements = { array: [], map: d3.map() };

    var _nodal_values = d3.map();
    var _elemental_values = d3.map();

    var _subscribers = [];

    var _bounding_box;

    function _mesh () {}

    _mesh.bounding_box = function () {
        return _bounding_box;
    };

    _mesh.elemental_value = function ( value, array ) {
        if ( arguments.length == 1 ) return _elemental_values.get( value );
        if ( arguments.length == 2 ) _elemental_values.set( value, array );
        if ( _subscribers.has( value ) ) _subscribers.get( value ).forEach( function ( cb ) { cb() } );
    };

    _mesh.elements = function (_) {
        if ( !arguments.length ) return _elements;
        if ( _.array && _.map ) {
            _elements = _;
        }
        return _mesh;
    };

    _mesh.element_array = function ( _ ) {
        if ( !arguments.length ) return _elements.array;
        _elements.array = _;
        return _mesh;
    };

    _mesh.element_index = function ( element_number ) {
        return _elements.map.get( element_number );
    };

    _mesh.element_map = function ( _ ) {
        if ( !arguments.length ) return _elements.map;
        _elements.map = _;
        return _mesh;
    };

    _mesh.nodal_value = function ( value, array ) {
        if ( arguments.length == 1 ) return _nodal_values.get( value );
        if ( arguments.length == 2 ) _nodal_values.set( value, array );
        _subscribers.forEach( function ( cb ) { cb( value ); } );
        return _mesh;
    };

    _mesh.nodes = function (_) {
        if ( !arguments.length ) return _nodes;
        if ( _.array && _.map ) {
            _nodes = _;
            _bounding_box = calculate_bbox( _nodes.array );
        }
        return _mesh;
    };

    _mesh.node_array = function ( _ ) {
        if ( !arguments.length ) return _nodes.array;
        _nodes.array = _;
        calculate_bbox( _mesh.node_array() );
        return _mesh;
    };

    _mesh.node_index = function ( node_number ) {
        return _nodes.map.get( node_number );
    };

    _mesh.node_map = function ( _ ) {
        if ( !arguments.length ) return _nodes.map;
        _nodes.map = _;
        return _mesh;
    };

    _mesh.num_elements = function () {
        return _elements.array.length / 3;
    };

    _mesh.num_nodes = function () {
        return _nodes.array.length / 3;
    };

    _mesh.subscribe = function ( callback ) {
        _subscribers.push( callback );
    };

    return _mesh;

}

function calculate_bbox ( node_array ) {

    var numnodes = node_array.length/3;
    var minx = Infinity, maxx = -Infinity;
    var miny = Infinity, maxy = -Infinity;
    var minz = Infinity, maxz = -Infinity;
    for ( var i=0; i<numnodes; ++i ) {
        if ( node_array[3*i] < minx ) minx = node_array[3*i];
        else if ( node_array[3*i] > maxx ) maxx = node_array[3*i];
        if ( node_array[3*i+1] < miny ) miny = node_array[3*i+1];
        else if ( node_array[3*i+1] > maxy ) maxy = node_array[3*i+1];
        if ( node_array[3*i+2] < minz ) minz = node_array[3*i+2];
        else if ( node_array[3*i+2] > maxz ) maxz = node_array[3*i+2];
    }
    return [[minx, miny, minz], [maxx, maxy, maxz]];

}

export { mesh }