var camera, scene, renderer, controls, textureEquirec, light, piecename, light2, around, chevron, material, img, model;
const container = document.getElementById("three");
const mycanvas = document.getElementById("mycanvas");
const container_slide = document.getElementById("configurableArea");
const ariane = document.getElementById("ariane");
const gltfLoader = new THREE.GLTFLoader();
const pieces_name_array = new Array();
let file = "machine";
const textureLoader = new THREE.TextureLoader();
let z = 50;

var colorname = {
    "#444444": "Gris",
    "#eeeeee": "Gris Clair",
    "#582900": "Marron",
    "#222222": "Anthracite",
    "#aaaaaa": "Gris",
    "#ffb100": "Jaune",
    "#0000ff": "Bleu",
    "#ff0000": "Rouge",
    "#666666": "Gris Fonc&#233",
    "#333333": "Anthracite",
    "#554444": "Taupe",
    "#555555": "Gris",
    "#111111": "Noir",
    "#ffffff": "Blanc",
    "#003dff": "Bleu",
    "#888888": "Gris",
};


window.jsPDF = window.jspdf.jsPDF;
const doc = new jsPDF();

//Get Data
var JSONdata = null;

function LoadJSON() {
    fetch("./" + file + ".json")
        .then((res) => {
            return res.json();
        })
        .then((data) => {
            JSONdata = data;
        });
}
//



init();
resizeCanvasToDisplaySize();
animate();

$('.buttonval').on('click', async function (cl) {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    $('#txtload').css('display', 'flex');
    $('#piecechoice').hide();
    file = urlParams.get('model');
    const firstLetter = file.charAt(0)
    const firstLetterCap = firstLetter.toUpperCase()
    const remainingLetters = file.slice(1)
    const capitalizedWord = firstLetterCap + remainingLetters
    $('#nametitle').text(capitalizedWord)
    LoadJSON();
    await test();
});


$('.buttonval')[0].click();

//USER EVENTS 

$('#logo-image').on('click', function () {
    window.location.href = "index.html";
});
$('#ariane').on('click', function (cl) {
    if (cl.target.id == "save") save();
    if (cl.target.id == "home") $('.chevron')[0].click();
    if (cl.target.className == "chevron" || cl.target.className == "piecetitle") {
        let ch = cl.target.offsetParent.lastChild;

        //reset before change tab :
        $('#ariane') > $("i").remove();
        $(".texture").remove();
        $(".matname").remove();
        $(".colname").remove();
        $(".supp").remove();
        $(".custom-select").remove();

        for (let i = 0; i < document.getElementsByClassName("chevron").length; i++) {
            let chev_i = ariane.getElementsByClassName("chevron")[i];
            let chev_i_p = chev_i.offsetParent.firstChild;
            chev_i_p.classList.remove("whitetext");
            chev_i_p.classList.remove("orangetext");
            if (i >= document.getElementsByClassName("chevron").length - 1) chev_i.src = "chevron-end.png";
            else chev_i.src = "chevron.png";
            chev_i.setAttribute("style", "z-index:" + chev_i.style.zIndex);

            if (i <= (50 - ch.style.zIndex) - 2) {
                chev_i_p.classList.add("orangetext");
                chev_i_p.innerHTML = '<i style="z-index: 70; font-size: 1.1em; " class="fa fa-check-circle-o" aria-hidden="true"></i>' + " " + chev_i_p.innerHTML;
            }
        }
        ch.id = "selected";
        ch.setAttribute("style", "z-index:" + ch.style.zIndex + ";filter: invert(63%) sepia(30%) saturate(4328%) hue-rotate(348deg) brightness(96%) contrast(95%) drop-shadow(0 0 10px #aaa);  ");
        if (ch.src.substr(ch.src.length - 7) == "end.png") ch.src = "chevron-end2.png";
        else ch.src = "chevron2.png";
        cl.target.offsetParent.firstChild.classList.add("whitetext");

        let name = $.trim(cl.target.offsetParent.firstChild.innerHTML);

        //OPTIONS :
        if (JSONdata[name].options != undefined) {
            $('#options').show();
            $('.options-group').append('<details class="custom-select"><summary class="radios"></summary><ul class="list"></ul></details>');

            for (let i = 0; i < JSONdata[name].options.length; i++) {
                $('.radios').append('<input type="radio" class="ritem" name="item" id="item' + (i + 1) + '" title="' + JSONdata[name].options[i] + '">');
                if (i == 0) $('.ritem')[0].checked = true;
                $('.list').append('<li><label for="item' + (i + 1) + '"> ' + JSONdata[name].options[i] + '</label></li>');
                $('.ritem').eq(i).on('click', function () {
                    for (let i = 0; i < JSONdata[name].options.length; i++) {
                        scene.getObjectByName(JSONdata[name].options[i]).visible = false;
                    }
                    scene.getObjectByName(JSONdata[name].options[i]).visible = true;
                });
            }
        }
        else $('#options').hide();

        //MATERIAUX :
        if (JSONdata[$.trim(cl.target.offsetParent.firstChild.innerHTML)].materiaux != undefined) {
            if (JSONdata[name].materiaux.length > 1) {
                $('#textures').show();
                for (let i = 0; i < JSONdata[name].materiaux.length; i++) {
                    $('.texture_group').append('<div class="texture"> <input class="circle img" type="image" src="textures/' + JSONdata[name].materiaux[i].toLowerCase() + '_color.png"' + ' id="' + name + '_' + JSONdata[name].materiaux[i].toLowerCase() + '"/><p class="matname">' + JSONdata[name].materiaux[i] + '</p></div>');
                }
            }
            else $('#textures').hide();
        }
        else $('#textures').hide();

        //COULEURS :
        if (JSONdata[$.trim(cl.target.offsetParent.firstChild.innerHTML)].couleurs != undefined) {
            if (JSONdata[name].couleurs.length > 1) {
                $('#couleurs').show();
                for (let i = 0; i < JSONdata[name].couleurs.length; i++) {
                    $('.color_group').append('<div class="supp"><div class="texture color circle" style="background-color:' + JSONdata[name].couleurs[i] + '" id ="' + name + '_' + JSONdata[name].couleurs[i].toLowerCase() + '"></div><p class="colname">' + colorname[JSONdata[name].couleurs[i]] + '</p><div>');
                }
            }
            else $('#couleurs').hide();
        }
        else $('#couleurs').hide();
        render();
    }
});

document.getElementById('configuration').addEventListener("click", function (e) {

    if (e.target.id.split('_').length == 2) {

        if (e.target.id.split('_')[1].charAt(0) == "#") {
            scene.getObjectByName(e.target.id.split('_')[0]).material.color = new THREE.Color(e.target.id.split('_')[1]);
        }
        else changematerial(e.target.id.split('_'));
    }
});
//

function resolveAfter2Seconds(x) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(x);
        }, 2000);
    });
}
async function f1() {
    const x = await resolveAfter2Seconds(10);
    resizeCanvasToDisplaySize();
}
function CreateAriane(obj, last = false, selected = false) {
    around = document.createElement('div');
    around.classList.add("around");

    chevron = document.createElement('input');
    chevron.classList.add("chevron");
    chevron.setAttribute("type", "image");
    piecename = document.createElement('p');
    piecename.classList.add("piecetitle");
    if (last) chevron.src = "chevron-end.png";
    else if (!selected) chevron.src = "chevron.png";
    z -= 1;
    chevron.setAttribute("style", "z-index:" + z);
    chevron.id = z;
    if (selected) {
        chevron.id = "selected";
        chevron.setAttribute("style", "z-index:" + z + ";filter: invert(63%) sepia(30%) saturate(4328%) hue-rotate(348deg) brightness(96%) contrast(95%) drop-shadow(0 0 10px #aaa);  ");
        chevron.src = "chevron2.png";
        piecename.classList.add("whitetext");
    }
    piecename.innerHTML = obj;

    around.appendChild(piecename);
    around.appendChild(chevron);
    ariane.insertBefore(around, document.getElementById("save2"));
}

async function changematerial(a) {

    let mat = scene.getObjectByName(a[0]).material;
    let colorsave = mat.color;
    if (a[2] != null) colorsave = new THREE.Color(a[2]);

    mat.roughness = 1;

    await loadTexture("textures/" + a[1] + "_color.png", mat);
    await loadTextureNormal("textures/" + a[1] + "_normal.png", mat);
    await loadTextureRoughness("textures/" + a[1] + "_roughness.png", mat);
    await loadTextureMetalness("textures/" + a[1] + "_metalness.png", mat);
    mat.color = colorsave;
    mat.needsUpdate = true;
    mat.name = a[1];

}

async function changemultiplematerial(a, mat) {

    //let mat = scene.getObjectByName(a[0]).material;
    let colorsave = mat.color;
    if (a[2] != null) colorsave = new THREE.Color(a[2]);

    mat.roughness = 1;
    /* 
     await loadTexture("textures/" + a[1] + "_color.png", mat);
     await loadTextureNormal("textures/" + a[1] + "_normal.png", mat);
     await loadTextureRoughness("textures/" + a[1] + "_roughness.png", mat);
     await loadTextureMetalness("textures/" + a[1] + "_metalness.png", mat);*/
    mat.color = colorsave;
    mat.needsUpdate = true;
    mat.name = a[1];

}

function save() {

    var doc = new jsPDF('p', 'pt', 'letter')
    // Supply data via script
    var body = Array();
    let arr = Array();
    scene.children.forEach(function (obj) {
        if (obj.type == "Group") {
            for (let i = 0; i < obj.children.length; i++) {
                if (obj.children[i].visible && JSONdata[obj.children[i].name] != undefined && obj.children[i].material != null) {
                    if (JSONdata[obj.children[i].name].parametrable) {
                        arr.push(obj.children[i]);
                    }
                }
                else if (obj.children[i].visible && obj.children[i].material != null) {
                    arr.push(obj.children[i]);
                }
            }
        }
    });
    for (let i = 0; i < arr.length; i++) {
        body[i] = new Array(4);
        body[i][0] = arr[i].name;
        body[i][1] = arr[i].material.name.split("#")[0];
        if (arr[i].material.color != null) body[i][2] = "#" + arr[i].material.color.getHexString();
        else body[i][2] = "";
    }

    //// generate auto table with body
    var y = 10;
    doc.setLineWidth(2);
    doc.addImage("Groupe Simphonis-logo.png", "JPEG", 15, 20, 1618 / 10, 382 / 10);
    doc.text(200, y = y + 60, "Configuration choisie");
    doc.autoTable({
        head: [['Piece', 'Materiau', 'Couleur']],
        body: body,
        startY: 90,
        headStyles: {
            fillColor: [238, 128, 28],
        },
        theme: 'grid',
    })

    var img = new Image();
    renderer.render(scene, camera);
    img.src = renderer.domElement.toDataURL();
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    doc.addImage(img, "JPEG", 20, 250, width / 2, height / 2);
    doc.save('configuration');

}

async function init() {

    //SET UP SCENE & CAMERA
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 10);
    camera.position.set(- 0.1, 0.9, 1.15);
    camera.updateProjectionMatrix();
    scene = new THREE.Scene();

    //SET UP RENDERER :
    renderer = new THREE.WebGLRenderer({ antialias: true, canvas: mycanvas });
    renderer.setPixelRatio(window.devicePixelRatio);
    camera.updateProjectionMatrix();
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.shadowMap.enabled = true;

    //LIGHTS & BACKGROUND :
    scene.background = new THREE.Color(0xeeeeee);
    var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.25);
    scene.add(hemiLight);
    var aLight = new THREE.DirectionalLight(0xffffff, 1);
    scene.add(aLight);
    aLight.position.set(0.5, 2, 0);

    var aLight2 = new THREE.DirectionalLight(0xffffff, 1);
    scene.add(aLight2);
    aLight2.position.set(-0.5, 2, 0);

    //CONTROLS
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.minDistance = 0.1;
    controls.maxDistance = 10; -
        controls.target.set(0, 0.1, 0);
    controls.update();
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;

    // MODEL IMPORT :
    textureEquirec = textureLoader.load('textures/env.jpg');
    textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
    textureEquirec.encoding = THREE.sRGBEncoding;


    $('#ariane').css({ "visibility": "visible" });

    //$('#loading').hide();
    window.addEventListener('resize', onWindowResize);
}

async function test() {
    const gltfData = await loadGltf();

    model = gltfData.scene;
    model.position.set(0, 0, 0);
    model.rotation.set(0, 3.4, 0);
    let count = 0;
    model.children.forEach(function (obj) {
        if (JSONdata[obj.name] == undefined) {
            obj.visible = false;
        }
        if (JSONdata[obj.name] != undefined && obj.material != null) {
            if (JSONdata[obj.name].parametrable) { count += 1; }
        }
    });

    scene.add(model);


    let c = 0;
    model.children.forEach(function (obj) {
        obj.castShadow = true;
        obj.receiveShadow = true;

        console.log("OBJ", obj.name);
        if (obj.material != null) obj.material.envMap = textureEquirec;
        else if (obj.children.length > 0) {
            obj.children.forEach(function (child) {
                child.material.envMap = textureEquirec;
            });
        }
        if (JSONdata[obj.name] != undefined) {

            if (JSONdata[obj.name].parametrable) {
                c += 1;
                if (c == 1) CreateAriane(obj.name, false, true);
                else if (c >= count) {
                    CreateAriane(obj.name, true);
                } else {
                    CreateAriane(obj.name);
                }
            }
            if (obj.material == undefined) {
                obj.children.forEach(function (child) {
                    if (JSONdata[obj.name].couleurs != null) {
                        //changemultiplematerial(new Array(obj.name, JSONdata[obj.name].materiaux[0].toLowerCase(), JSONdata[obj.name].couleurs[0]), child.material);
                    }
                    //else changemultiplematerial(new Array(obj.name, JSONdata[obj.name].materiaux[0].toLowerCase()), child.material);
                    child.material.needsUpdate = true;
                });
            } else {
                if (JSONdata[obj.name].couleurs != null) {
                    changematerial(new Array(obj.name, JSONdata[obj.name].materiaux[0].toLowerCase(), JSONdata[obj.name].couleurs[0]));
                }
                else changematerial(new Array(obj.name, JSONdata[obj.name].materiaux[0].toLowerCase()));
                obj.material.needsUpdate = true;
            }
        }
    });
    $('.chevron')[0].click();
    $('#loading').hide();
    f1();

}

//LOADERS :
function loadTexture(url, mat) {
    return new Promise((resolve, reject) => {
        textureLoader.load(url, texture => {
            resolve(texture);
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            if (mat.map != null) texture.repeat.set(mat.map.repeat.x, mat.map.repeat.y);
            mat.map = texture;
        }, null, reject);
    });
}

function loadTextureNormal(url, mat) {
    return new Promise((resolve, reject) => {
        textureLoader.load(url, texture => {
            resolve(texture);
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            if (mat.map != null) texture.repeat.set(mat.map.repeat.x, mat.map.repeat.y);
            mat.normalMap = texture;
        }, null, reject);
    });
}

function loadTextureRoughness(url, mat) {
    return new Promise((resolve, reject) => {
        textureLoader.load(url, texture => {
            resolve(texture);
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            if (mat.map != null) texture.repeat.set(mat.map.repeat.x, mat.map.repeat.y);
            mat.roughnessMap = texture;
        }, null, reject);
    }).catch((message) => {
        mat.roughness = 1;
        mat.roughnessMap = null;
    });;
}

function loadTextureMetalness(url, mat) {
    return new Promise((resolve, reject) => {
        textureLoader.load(url, texture => {
            resolve(texture);
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            if (mat.map != null) texture.repeat.set(mat.map.repeat.x, mat.map.repeat.y);
            mat.metalness = 1;
            mat.metalnessMap = texture;
        }, null, reject);
    }).catch((message) => {
        mat.metalness = 0;
        mat.metalnessMap = null;
    });
}

function loadGltf() {
    return new Promise((resolve, reject) => {
        gltfLoader.load('models/gltf/' + file + '.gltf', data => { resolve(data) }, null, reject);
    });
}
//

function rotateObject(object, degreeX=0, degreeY=0, degreeZ=0) {
   object.rotateX(THREE.Math.degToRad(degreeX));
   object.rotateY(THREE.Math.degToRad(degreeY));
   object.rotateZ(THREE.Math.degToRad(degreeZ));
} 

//RESIZE :
function resizeCanvasToDisplaySize() {

    const canvas = renderer.domElement;
    // look up the size the canvas is being displayed
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    // adjust displayBuffer size to match
    if (canvas.width !== width || canvas.height !== height) {
        // you must pass false here or three.js sadly fights the browser
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        // update any render target sizes here
    }
}

function onWindowResize() {
    resizeCanvasToDisplaySize();
}
//


function animate(t) {
    requestAnimationFrame(animate);



    render();
    if (t > 2500 && t < 6000) {
        resizeCanvasToDisplaySize();
    }
}

function render() {
    renderer.render(scene, camera);
}
