const React = require('react');
const isEqual = require('lodash.isequal');
const { useServices } = require('stremio/services');
const { useStreamingServer } = require('stremio/common');

const CACHE_SIZES = [0, 2147483648, 5368709120, 10737418240, null];

const cacheSizeToString = (size) => {
    return size === null ?
        'Infinite'
        :
        size === 0 ?
            'No caching'
            :
            `${size / 1024 / 1024 / 1024}GiB`;
};

const TORRENT_PROFILES = {
    default: {
        btDownloadSpeedHardLimit: 2621440,
        btDownloadSpeedSoftLimit: 1677721.6,
        btHandshakeTimeout: 20000,
        btMaxConnections: 35,
        btMinPeersForStable: 5,
        btRequestTimeout: 4000
    },
    soft: {
        btDownloadSpeedHardLimit: 1677721.6,
        btDownloadSpeedSoftLimit: 1677721.6,
        btHandshakeTimeout: 20000,
        btMaxConnections: 35,
        btMinPeersForStable: 5,
        btRequestTimeout: 4000
    },
    fast: {
        btDownloadSpeedHardLimit: 39321600,
        btDownloadSpeedSoftLimit: 4194304,
        btHandshakeTimeout: 20000,
        btMaxConnections: 200,
        btMinPeersForStable: 10,
        btRequestTimeout: 4000
    }
};

const useStreaminServerSettingsInputs = () => {
    const { core } = useServices();
    const streaminServer = useStreamingServer();
    const cacheSizeSelect = React.useMemo(() => {
        if (streaminServer.type !== 'Ready') {
            return null;
        }

        return {
            options: CACHE_SIZES.map((size) => ({
                label: cacheSizeToString(size),
                value: JSON.stringify(size)
            })),
            selected: [JSON.stringify(streaminServer.settings.cacheSize)],
            renderLabelText: () => {
                return cacheSizeToString(streaminServer.settings.cacheSize);
            },
            onSelect: (event) => {
                core.dispatch({
                    action: 'Ctx',
                    args: {
                        action: 'UpdateSettings',
                        args: {
                            ...streaminServer.settings,
                            cacheSize: JSON.parse(event.value)
                        }
                    }
                });
            }
        };
    }, [streaminServer.type, streaminServer.settings]);
    const torrentProfileSelect = React.useMemo(() => {
        if (streaminServer.type !== 'Ready') {
            return null;
        }

        const selectedTorrentProfile = {
            btDownloadSpeedHardLimit: streaminServer.settings.btDownloadSpeedHardLimit,
            btDownloadSpeedSoftLimit: streaminServer.settings.btDownloadSpeedSoftLimit,
            btHandshakeTimeout: streaminServer.settings.btHandshakeTimeout,
            btMaxConnections: streaminServer.settings.btMaxConnections,
            btMinPeersForStable: streaminServer.settings.btMinPeersForStable,
            btRequestTimeout: streaminServer.settings.btRequestTimeout
        };
        const isCustomTorrentProfileSelected = Object.values(TORRENT_PROFILES).every((torrentProfile) => {
            return !isEqual(torrentProfile, selectedTorrentProfile);
        });
        return {
            options: Object.keys(TORRENT_PROFILES)
                .map((profileName) => ({
                    label: profileName,
                    value: JSON.stringify(TORRENT_PROFILES[profileName])
                }))
                .concat(
                    isCustomTorrentProfileSelected ?
                        [{
                            label: 'custom',
                            value: JSON.stringify(selectedTorrentProfile)
                        }]
                        :
                        []
                ),
            selected: [JSON.stringify(selectedTorrentProfile)],
            renderLabelText: () => {
                return Object.keys(TORRENT_PROFILES).reduce((result, profileName) => {
                    if (isEqual(TORRENT_PROFILES[profileName], selectedTorrentProfile)) {
                        return profileName;
                    }

                    return result;
                }, 'custom');
            }
        };
    }, [streaminServer.type, streaminServer.settings]);
    return { cacheSizeSelect, torrentProfileSelect };
};

module.exports = useStreaminServerSettingsInputs;