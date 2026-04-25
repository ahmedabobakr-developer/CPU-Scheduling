function compareMetrics(val1, val2, id1, id2) {
    const el1 = document.getElementById(id1);
    const el2 = document.getElementById(id2);

    el1.style.color = '';
    el2.style.color = '';

    if (val1 < val2) {
        el1.style.color = 'var(--accent-green)';
        el2.style.color = 'var(--accent-red)';
    } else if (val2 < val1) {
        el1.style.color = 'var(--accent-red)';
        el2.style.color = 'var(--accent-green)';
    }
}