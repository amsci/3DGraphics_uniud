
function BufferIsoSphereGeometry(radius, detail){
    
    var t = ( 1 + Math.sqrt( 5 ) ) / 2;
    var f = radius/Math.sqrt(1+Math.pow(t,2));
    var verticesArray = [
        - f, t*f, 0, 	    f, t*f, 0, 	    - f, -t*f, 0, 	f, - t*f, 0,
        0, - f, t*f, 	    0, f, t*f,      0, - f, -t*f,   0, f, - t*f,
        t*f, 0, - f, 	    t*f, 0, f, 	    - t*f, 0,- f, 	- t*f, 0, f
    ];
    var indicesArray = [
        0, 11, 5, 	0, 5, 1, 	0, 1, 7, 	0, 7, 10, 	0, 10, 11,
        1, 5, 9, 	5, 11, 4,	11, 10, 2,	10, 7, 6,	7, 1, 8,
        3, 9, 4, 	3, 4, 2,	3, 2, 6,	3, 6, 8,	3, 8, 9,
        4, 9, 5, 	2, 4, 11,	6, 2, 10,	8, 6, 7,	9, 8, 1
    ];
    // for(var i=0; i<detail; i++){
    //     var subdivision = Subdivide(verticesArray,indicesArray,radius);
    //     verticesArray = subdivision.verticesArray;
    //     indicesArray = subdivision.indicesArray;
    // }
    for(var i=0; i<detail; i++){
        subdivide();
    }
    
    var normalsArray = [...verticesArray]; //copia l'array dei vertici
    var vertices = new Float32Array(verticesArray, 0, verticesArray.length);
    var normals = new Float32Array(normalsArray, 0, verticesArray.length);
    var indices = new Uint16Array(indicesArray, 0, indicesArray.length);

    var geometry = new THREE.BufferGeometry();
    geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.addAttribute('normal', new THREE.BufferAttribute(normals, 3));
    geometry.normalizeNormals();
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));

    function subdivide(){
        var num_faces = indicesArray.length/3;
        var middles = [], m=[0,0,0];
        
        for(var i=0; i<num_faces; i++){ //per ogni faccia
            for(var j=0; j<3; j++){  //per ogni lato della faccia
                var a = indicesArray[j]; //prendi un estremo
                var b = indicesArray[(j+1)%3]; //prendi l'altro estremo
                var mid = middles.filter(side => 
                    (side[0][0]==a && side[0][1]==b) || 
                    (side[0][0]==b && side[0][1]==a)
                ); //controlla se il punto medio di questo lato è gia stato calcolato
                if( mid.length > 0 ){
                    m[j] = mid[0][1]; //se sì, metti il suo indice in m
                } else {
                    var AB = new THREE.Vector3(
                        verticesArray[3*a] + verticesArray[3*b],
                        verticesArray[3*a+1] + verticesArray[3*b+1],
                        verticesArray[3*a+2] + verticesArray[3*b+2]
                    ).normalize().multiplyScalar(radius); //altrimenti calcola il punto medio e proiettalo sulla sfera
                    verticesArray.push( AB.x, AB.y, AB.z ); //aggiungilo alla lista dei vertici
                    m[j] = verticesArray.length/3-1; //e metti il suo indice in m
                    middles.push( [[a,b],m[j]] ); //registra in middles l'avvenuto calcolo del punto medio
                }
            }
    
            var a,b,c,ab,bc,ca; //i sei indici dei vertici su questa faccia da dividere
            a = indicesArray[0];
            b = indicesArray[1];
            c = indicesArray[2];
            ab = m[0];
            bc = m[1];
            ca = m[2];
    
            indicesArray.splice(0,3); //elimina la faccia corrente (la prima dell'elenco)
    
            indicesArray.push(
                a, ab, ca,
                ab,b, bc,
                c,ca,bc,
                ab,bc,ca
            ); //inserisci le nuove quattro facce
        }
    }
    return geometry;
}

function IsoSphereGeometry(radius, detail){
    var geometry = new THREE.Geometry().fromBufferGeometry(BufferIsoSphereGeometry(radius, detail));
    geometry.mergeVertices();
    return geometry;
}
