import _ from 'lodash';

export class WidgetUtils {
    static Range(from, to) {
        return {
            from: from,
            to: to
        };
    }

    // True if inside, false if on edge.
    static posInsideRange(pos, range) {
        return WidgetUtils.posCmp(range.from, pos) < 0 && WidgetUtils.posCmp(pos, range.to) < 0;
    }

    // Return negative / 0 / positive.  a < b iff posCmp(a, b) < 0 etc.
    static posCmp(a, b) {
        return (a.line - b.line) || (a.ch - b.ch);
    }

    static Pos(line, ch) {
        return {
            line: line,
            ch: ch
        };
    }

    // Return true if object is a position
    static isPos(pos) {
        return _.isUndefined(pos.line);
    }

    static posIsBefore(a, b) {
        return (WidgetUtils.posCmp(a, b) < 0);
    }

    // True if there is at least one character in common, false if just touching.
    static rangesOverlap(fromTo1, fromTo2) {
        return (WidgetUtils.posCmp(fromTo1.from, fromTo2.to) < 0 &&
            WidgetUtils.posCmp(fromTo2.from, fromTo1.to) < 0);
    }

    // True if position are equal
    static posEqual(r1, r2) {
        return (r1.line == r2.line && r2.ch == r1.ch);
    }
}
