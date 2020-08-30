/*©agpl*************************************************************************
*                                                                              *
* Napkin Maps – User-friendly map solution for the Napkin platform             *
* Copyright (C) 2020  Napkin AS                                                *
*                                                                              *
* This program is free software: you can redistribute it and/or modify         *
* it under the terms of the GNU Affero General Public License as published by  *
* the Free Software Foundation, either version 3 of the License, or            *
* (at your option) any later version.                                          *
*                                                                              *
* This program is distributed in the hope that it will be useful,              *
* but WITHOUT ANY WARRANTY; without even the implied warranty of               *
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the                 *
* GNU Affero General Public License for more details.                          *
*                                                                              *
* You should have received a copy of the GNU Affero General Public License     *
* along with this program. If not, see <http://www.gnu.org/licenses/>.         *
*                                                                              *
*****************************************************************************©*/

"use strict";

L.Map.addInitHook(function() {

  // Geolocation map search
  this.addControl(
    new GeoSearch.SearchControl({
      provider: new GeoSearch.OpenStreetMapProvider(),
      style: "bar",
      showMarker: false,
      showPopup: false,
      autoClose: true
    })
  );


  // Distance scale
  this.addControl(
    L.control.scale({
      position: "bottomright",
      metric: true,
      imperial: false
    })
  );


  // Zoom control
  this.addControl(
    L.control.zoom({
      position: "topright"
    })
  );


  // Directions
  this.addControl(
    L.Routing.control({
      //waypoints: [],
      geocoder: L.Control.Geocoder.nominatim(),
      routeWhileDragging: false,
      showAlternatives: true,
      collapsible: true,
      show: false
    })
  );


  // Geoposition button (GPS tracking)
  this.addControl(
    L.control.locate({
      position: "topleft",
      icon: "fa fa-crosshairs"
    })
  );


  // Print-map
  this.addControl(
    L.easyPrint({
      title: "Print map to image file",
      position: "topleft",
      sizeModes: ["A4Landscape", "A4Portrait"],
      filename: "Napkin-Maps",
      exportOnly: true,
      hideControlContainer: false,
      hidden: false
    })
  );


  // Street-View control
  $("#streetviewContainer #back").click(function(ev) {
    $("#streetviewContainer").css("visibility", "hidden");
    $("#streetviewContainer #not_found").css("visibility", "hidden");
  });

  let streetviewEnable = ev => {
    //L.DomEvent.stopPropagation(ev);
    streetviewBtn.state("streetviewStart");

    let latlng = ev.latlng;
    let lat = latlng.lat,
        lng = latlng.lng;

    let panorama = new google.maps.StreetViewPanorama(
      document.querySelector("#streetview"),
      {
        position: { lat: lat, lng: lng },
        addressControlOptions: {
          position: google.maps.ControlPosition.TOP_RIGHT
        },
        linksControl: false,
        panControl: false,
        enableCloseButton: false,
        fullscreenControl: false,
        zoomControl: false
      }
    );

    panorama.H.then(() => {
      setTimeout(() => {

        if(panorama.getStatus() == "ZERO_RESULTS")
          $("#streetviewContainer #not_found").css("visibility", "visible");

        $("#streetviewContainer").css("visibility", "visible");

      }, 500);
    });
  };

  let streetviewBtn = L.easyButton({
    states: [
      {
        stateName: "streetviewStart",
        icon: "fa-male",
        title: "Street-View",
        onClick: control => {
          control.state("streetviewCancel");
          this.once("click", streetviewEnable);
        }
      },
      {
        stateName: "streetviewCancel",
        icon: "fa-times",
        title: "Cancel street-View",
        onClick: control => {
          this.off("click", streetviewEnable);
          control.state("streetviewStart");
        }
      }
    ]
  });
  this.addControl( streetviewBtn );


  // Curcor coordinates
  this.addControl(
    L.control.coordinates({
      position: "bottomleft",
      decimals: 6,
      decimalSeperator: ".",
      labelTemplateLat: "Lat: {y}",
      labelTemplateLng: "Lon: {x}",
      enableUserInput: false,
      useLatLngOrder: true
    })
  );


  // Grid lines
  this.grid = L.latlngGraticule();















  this.basemaps = [];

  this.basemaps.push(L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                    {
                      id: uuid(),
                      name: "OpenStreetMap",
                      attribution: "&copy; <a href=\"http://openstreetmap.org/copyright\" target=\"_blank\">OpenStreetMap</a> contributors | &copy; <a href=\"https://github.com/NapkinGIS/Napkin-Maps/blob/master/LICENCE\" target=\"_blank\">Napkin AS</a>"
                    }));

  this.basemaps.push(L.tileLayer("https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
                    {
                      id: uuid(),
                      name: "Google - Hybrid",
                      attribution: "&copy; <a href=\"https://www.google.com/\" target=\"_blank\">Google</a> contributors | &copy; <a href=\"https://github.com/NapkinGIS/Napkin-Maps/blob/master/LICENCE\" target=\"_blank\">Napkin AS</a>"
                    }));

  /*this.basemaps.push(L.tileLayer("https://www.google.com/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}",
                    {
                      id: uuid(),
                      name: "Google - Satellite",
                      attribution: "&copy; <a href=\"https://www.google.com/\" target=\"_blank\">Google</a> contributors | &copy; <a href=\"https://github.com/NapkinGIS/Napkin-Maps/blob/master/LICENCE\" target=\"_blank\">Napkin AS</a>"
                    }));*/

  this.basemaps[0].addTo(this);
















  this.layers = [];

  let drawingLayer = L.featureGroup();

  let markercluster = L.markerClusterGroup();
  //this.addLayer(markercluster);

  this.layers.push(drawingLayer);
  this.layers[0].addTo(this);

  this.on("draw:created", ev => {
    let object = ev.layer,
        type = ev.layerType;

    this.layers[0].addLayer(object);

    //if(type == "marker") markercluster.addLayer(object);
    //else this.layers[0].addLayer(object);
  });

  this.on("draw:edited", ev => {
    let layers = ev.layers;
  });
















  // Draw control
  this.drawControl = new L.Control.Draw({
    position: "bottomleft",
    edit: {
      featureGroup: this.layers[0]
    },
    draw: {
      marker: false,
      polyline: {
        shapeOptions: {
          color: "#ff9900",
          editing: { className: "" }
        }
      },
      polygon: {
        shapeOptions: {
          color: "#ff9900",
          fillColor: "#ff9900",
          editing: { className: "" }
        }
      },
      circle: {
        shapeOptions: {
          color: "#ff9900",
          fillColor: "#ff9900",
          editing: { className: "" }
        }
      },
      rectangle: false,
      circlemarker: false
    }
  });
  this.addControl(this.drawControl);











  let underlay = {
    "OpenStreetMap": this.basemaps[0],
    "Google": this.basemaps[1]
  };

  let overlay = {
    "Drawing": this.layers[0],
    "Grid": this.grid
  };

  L.control.layers(underlay, overlay, {
    position: "bottomright"
  }).addTo(this);











  // Displays popup on map when user right-clicks
  this.on("contextmenu", ev => {
    //L.DomEvent.stopPropagation(ev);

    let latlng = ev.latlng;
    let lat = latlng.lat,
        lng = latlng.lng;

    console.log(lat, lng);
  });

});




L.Map.include({

  getLayer: function(layerId) {
    //
  },

  exportData: function() {
    //
  },

  importData: function(data) {
    //
  }

});
