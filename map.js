import { Feature, Map, Overlay, View } from "ol";
import { OSM, Vector as VectorSource } from "ol/source";
import { Point } from "ol/geom";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { addEquivalentTransforms, fromLonLat, toLonLat } from "ol/proj";
import Geolocation from "ol/Geolocation";
import Text from "ol/style/Text";
import { Circle, Fill, Style } from "ol/style";
import { createOrUpdateFromCoordinates } from "ol/extent";

import getFriends from "/firebase.js";
import updateCoordinates from "/firebase.js";

$(document).ready(() => {
    setTimeout(() => {
        let view = new View({
            center: [0, 0],
            zoom: 15,
        });

        let vectorsource = new VectorSource();
        console.log("fiusaif;auwh");

        const map = new Map({
            target: "map",
            view: view,
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
            ],
        });

        const proj = view.getProjection();

        function styleFriend(name) {
            return new Style({
                image: new Circle({
                    radius: 9,
                    fill: new Fill({
                        color: "red",
                    }),
                }),
                text: new Text({
                    text: name,
                    offsetY: 15,
                }),
            });
        }

        // returns a VectorSource with all the friends on it
        function drawFriends(friends) {
            console.log(friends);
            const vectorsource = new VectorSource();
            for (let f in friends) {
                let feature = new Feature(
                    new Point(
                        fromLonLat(
                            [friends[f]["longitude"], friends[f]["latitude"]],
                            proj
                        )
                    )
                );
                feature.setStyle(styleFriend(friends[f]["name"]));
                vectorsource.addFeature(feature);
            }
            return vectorsource;
        }

        getFriends(window.user1).then((Array) => {
            vectorsource = drawFriends(Array);
        });

        self = new Feature(new Point([0, 0]));
        vectorsource.addFeature(self);

        map.addLayer(
            new VectorLayer({
                source: vectorsource,
            })
        );

        const geolocation = new Geolocation({
            tracking: true,
            trackingOptions: {
                enableHighAccuracy: true,
            },
            projection: view.getProjection(),
        });

        geolocation.on("error", function (error) {
            console.log("there's a problem here");
        });

        function getLocation() {
            return toLonLat(geolocation.getPosition());
        }

        geolocation.on("change:position", function () {
            const coordinates = geolocation.getPosition();
            self.setGeometry(coordinates ? new Point(coordinates) : null);
            view.setCenter(coordinates);
            const lonlat = toLonLat(coordinates);
            updateCoordinates(user1, lonlat);
        });
    }, 2000);
});
