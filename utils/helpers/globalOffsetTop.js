export default function globalOffsetTop(element) {
    let y = 0;
    const getOffset = function (element) {
        y += element.offsetTop;
        if (element.offsetParent !== null) {
            getOffset(element.offsetParent);
        }
    };
    getOffset(element);
    return y;
}
