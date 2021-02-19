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
* along with this program.  If not, see <http://www.gnu.org/licenses/>.        *
*                                                                              *
*****************************************************************************©*/

"use strict";

L.Map.addInitHook(function() {

	// Geolocation map search
	this.addControl(
		new GeoSearch.SearchControl({
			provider: new GeoSearch.OpenStreetMapProvider(),
			style: "bar",
			autoClose: true,
			keepResult: true
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
			geocoder: L.Control.Geocoder.nominatim(),
			//waypoints: [],
			//addWaypoints: false,
			routeWhileDragging: false,
			showAlternatives: true,
			collapsible: true,
			show: false,
			position: "topright"
		})
	);


	// Geoposition button (GPS tracking)
	this.addControl(
		L.control.locate({
			position: "topleft",
			icon: "fa fa-crosshairs"
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
		position: "topleft",
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
			decimals: 4,
			decimalSeperator: ".",
			labelTemplateLat: "Lat: {y}",
			labelTemplateLng: "Lon: {x}",
			enableUserInput: false,
			useLatLngOrder: true
		})
	);


	// Distance scale
	this.addControl(
		L.control.scale({
			position: "bottomleft",
			metric: true,
			imperial: false
		})
	);















	this.basemaps = [];

	this.basemaps.push(L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
										{
											id: uuid(),
											name: "StreetMap",
											attribution: `
												&copy; <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\">OSM</a>
												&copy; <a href=\"https://carto.com/attributions\" target=\"_blank\">CARTO</a> |
												&copy; <a href=\"https://github.com/NapkinGIS/Napkin-Maps/blob/master/LICENCE\" target=\"_blank\">Napkin</a>
											`,
											subdomains: "abcd"
										}));

	this.basemaps.push(L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
										{
											id: uuid(),
											name: "Satellite",
											attribution: `
												&copy; <a href=\"https://www.esri.com/en-us/legal/terms/full-master-agreement\" target=\"_blank\">ESRI</a> |
												&copy; <a href=\"https://github.com/NapkinGIS/Napkin-Maps/blob/master/LICENCE\" target=\"_blank\">Napkin</a>
											`
										}));

	this.basemaps[0].addTo(this);
















	this.layers = [];

	let markercluster = L.markerClusterGroup();
	//this.addLayer(markercluster);

	/*let drawingLayer = L.featureGroup(),
		objectLayer = L.featureGroup();

	this.layers.push(drawingLayer);
	this.layers[0].addTo(this);

	this.layers.push(objectLayer);
	this.layers[1].addTo(this);

	this.on("draw:created", ev => {
		let object = ev.layer,
			type = ev.layerType;

		this.layers[0].addLayer(object);

		//if(type == "marker") this.markercluster.addLayer(object);
		//else this.layers[0].addLayer(object);
	});

	this.on("draw:edited", ev => {});*/
















	// Draw control
	/*this.drawControl = new L.Control.Draw({
		position: "topleft",
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
			rectangle: {
				shapeOptions: {
					color: "#ff9900",
					fillColor: "#ff9900",
					editing: { className: "" }
				}
			},
			circlemarker: false
		}
	});
	this.addControl(this.drawControl);*/











	let underlay = {
		"StreetMap": this.basemaps[0],
		"Satellite": this.basemaps[1]
	}, overlay = {};

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

	/*addressToLatLng: async function(address) {
		if(!address) return;

		let key = 'AIzaSyBOhUleCCqG94Kujoff1yFCWbpDj1of4PI';
		let url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${key}`;

		let res = await fetch(url)
		let data = await res.json();

		if(data.results.length <= 0) {
			console.error("No position found for the address");
			return;
		}

		return data.results[0].geometry.location;
	},

	panToAddress: async function(address, zoom) {
		let latlng = await this.addressToLatLng(address);
		if(!latlng) return;

		if(!zoom) zoom = 15;
		this.setView(latlng, zoom);
	},

	drawPoint: async function(address, radius, color) {
		let latlng = await this.addressToLatLng(address);
		if(!latlng) return;

		this.layers[1].addLayer(
			L.circleMarker(latlng),
			{
				radius: radius || 8,
				color: color || '#3388ff'
			}
		);
	}*/

});
