export default function globalOffsetLeft(element) {
    let y = 0;
    const getOffset = function (element) {
        y += element.offsetLeft;
        if (element.offsetParent !== null) {
            getOffset(element.offsetParent);
        }
    };
    getOffset(element);
    return y;
}
