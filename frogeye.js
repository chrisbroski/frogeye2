/*jslint node: true, sloppy: true */
var previous = {};
previous.edges = [];

function motionLocation(ii, visionWidth, imgPixelSize) {
    var topPos = Math.floor(ii / imgPixelSize * 3),
        leftPos = (Math.floor(ii / Math.floor(visionWidth / 4)) % 4);

    return topPos * 4 + leftPos;
}

function normalize(intArray, max) {
    return intArray.map(function (item) {
        return item / max;
    });
}

function isEdge(ii, visionWidth, imgPixelSize, luma, difference, threshold) {
    var adjacent = [];

    if (ii > visionWidth) {
        adjacent.push(luma[ii - visionWidth]); // top
    }
    if (ii % visionWidth < visionWidth - 1) {
        adjacent.push(luma[ii + 1]); // right
    }
    if (ii < imgPixelSize - visionWidth) {
        adjacent.push(luma[ii + visionWidth]); // bottom
    }
    if (ii % visionWidth > 0) {
        adjacent.push(luma[ii - 1]); // left
    }

    // if all adjacent luma < threshold, perist previous
    function isAllAdjacentBelowDiff() {
        return adjacent.every(function (adj) {
            return adj < threshold;
        });
    }
    if (isAllAdjacentBelowDiff()) {
        return (previous.edges.indexOf(ii) > -1);
    }

    // If previous is true, decrease difference by, say 10%? (until jitter stops)
    if (previous.edges.indexOf(ii) > -1) {
        difference = difference * 0.9;
    }

    // check adjacent for a significant increase in luma
    return adjacent.some(function (compare) {
        return (compare - luma[ii] > difference);
    });
}

function lumaProcess(luma, len, visionWidth, changeAmount) {
    var ii,
        diff,
        brightness = 0,
        motionLoc = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        contrast = [];

    for (ii = 0; ii < len; ii += 1) {
        brightness += luma.current[ii];
        if (isEdge(ii, visionWidth, len, luma.current, 50, 20)) {
            contrast.push(ii);
        }
        if (luma.previous.length) {
            diff = Math.abs(luma.previous[ii] - luma.current[ii]);
            if (diff > changeAmount) {
                motionLoc[motionLocation(ii, visionWidth, len)] += 1;
            }
        }
    }
    previous.edges = contrast;

    return {
        "brightness": brightness / len / 256,
        "moveLocation": normalize(motionLoc, len / 12),
        "edges": contrast
    };
}

function frogeye(luma, imgPixelSize, visionWidth, changeAmount) {
    var retina = lumaProcess(luma, imgPixelSize, visionWidth, changeAmount);

    return {
        "brightness": retina.brightness,
        "moveLocation": retina.moveLocation,
        "edges": retina.edges
    };
}

module.exports = frogeye;
