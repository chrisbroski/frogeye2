/*jslint node: true, sloppy: true */
var state = {
    edge: {
        previous: [],
        current: []
    }
};

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
    var edge;

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
    /*function isAllAdjacentBelowDiff() {
        return adjacent.every(function (adj) {
            return adj < threshold;
        });
    }
    if (isAllAdjacentBelowDiff()) {
        return (previous.edges.indexOf(ii) > -1);
    }*/

    // If previous is true, decrease difference by, say 10%? (until jitter stops)
    edge = luma[ii] * difference;
    if (state.edge.previous.indexOf(ii) > -1) {
        edge = edge * 0.9;
    }

    // check adjacent for a significant increase in luma
    return adjacent.some(function (compare) {
        return (compare > edge);
    });
}

function frogeye(luma, len, visionWidth, changeAmount) {
    var ii,
        diff,
        brightness = 0,
        motionLoc = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        contrast = [];

    for (ii = 0; ii < len; ii += 1) {
        brightness += luma.current[ii];
        if (isEdge(ii, visionWidth, len, luma.current, 2.0, 20)) {
            contrast.push(ii);
        }
        if (luma.previous.length) {
            diff = Math.abs(luma.previous[ii] - luma.current[ii]);
            if (diff > changeAmount) {
                motionLoc[motionLocation(ii, visionWidth, len)] += 1;
            }
        }
    }
    state.edge.previous = contrast;

    return {
        "brightness": brightness / len / 256,
        "moveLocation": normalize(motionLoc, len / 12),
        "edges": contrast
    };
}

module.exports = frogeye;
