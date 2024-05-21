const dbus = require('dbus');
const chadburn = require('chadburn');
const Parser0183 = require('@signalk/nmea0183-signalk')

module.exports = function (app) {
    var plugin = {};

    plugin.id = 'signalk-modemmanager-location';
    plugin.name = 'ModemManager Location';
    plugin.description = 'Provides location from ModemManager';
    let interval;

    plugin.start = async function (options, restartPlugin) {
        const bus = dbus.getBus('system');

        const modem_manager = await chadburn.ModemManager.init(bus);
        const modem0 = modem_manager.getModem(0);

        const source = chadburn.ModemManagerTypes.ModemLocationSource.MM_MODEM_LOCATION_SOURCE_GPS_NMEA;
        const modem0location = await modem0.getLocation();
        await modem0location.setup(source, true);
        const parser = new Parser0183({ app });

        interval = setInterval(async function () {
            const location = await modem0location.getLocation();
            const nmea = location[source];
            if (typeof nmea === 'string') {
                nmea
                    .split('\n')
                    .filter((line) => line.startsWith('$'))
                    .map(parser.parse.bind(parser))
                    .filter((delta) => delta !== null)
                    .forEach((delta) => {
                        app.handleMessage(plugin.id, delta);
                    });
            }
        }, 1000);
        app.setPluginStatus('Started');
        app.debug('Plugin started');
    };

    plugin.stop = function () {
        if (interval) {
            clearInterval(interval);
        }
        app.setPluginStatus('Stopped');
        app.debug('Plugin stopped');
    };

    plugin.schema = {
    };

    return plugin;
};
