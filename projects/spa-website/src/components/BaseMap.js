
import React from 'react';
import { loadModules } from 'esri-loader';

class BaseMap extends React.Component {
    static defaultProps = {
      mapOptions: {
        basemap: 'gray-vector'
      },
      viewOptions: {
        zoom: 12,
        center: [ -122.31, 47.60 ]
      }
    };

    constructor(props) {
      super(props);
      this.state = { status: 'loading' };
      this.esriOptions = {
        url: 'https://js.arcgis.com/4.6/'
      };
      this.style = {
        container: {
          height: '100vh',
          width: '100vw'
        },
        map: {
          padding: 0,
          margin: 0,
          height: '100%',
          width: '100%'
        }
      };
    }

    componentDidMount() {
      loadModules([ 'esri/Map', 'esri/views/MapView' ], this.esriOptions)
        .then(([Map, MapView]) => {
          const map = new Map(this.props.mapOptions);
          const view = new MapView({
            container: 'esriMapView',
            map,
            ...this.props.viewOptions
          });
          view.then(() => {
            this.setState({ map, view, status: 'loaded' });
          });
        });
    }

    render() {
      return (
        <div style={this.style.container}>
          <div id='esriMapView' style={this.style.map}>
            {this.state.status === 'loading' && (<div>Loading...</div>)}
          </div>
        </div>
      );
    }
}

export default BaseMap;

