/**
 * @jest-environment jsdom
 */

import { jest, describe, it, expect, beforeEach, beforeAll, afterAll } from '@jest/globals';
import { POPOVER_PADDING, createPopover, setPopoverPosition, PopoverOptions, attachPopoverEventListeners, escapeLeadingIdNumber, computeLeft, computeTop } from '../popover_helpers';

// Reset mocks before each test
beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.MockedFunction<typeof fetch>) = jest.fn(
        (input: RequestInfo | URL, init?: RequestInit) => {
            const url = input.toString();

            if (url.includes('text/html')) {
                return Promise.resolve({
                    headers: {
                        get: (header: string) => {
                            if (header === 'Content-Type') return 'text/html';
                            return null;
                        },
                    },
                    text: () => Promise.resolve('<html><body><div class="popover-hint">Test HTML Content</div></body></html>'),
                } as unknown as Response);
            }

            if (url.includes('image/jpeg')) {
                return Promise.resolve({
                    headers: {
                        get: (header: string) => {
                            if (header === 'Content-Type') return 'image/jpeg';
                            return null;
                        },
                    },
                    blob: () => Promise.resolve(new Blob()),
                } as unknown as Response);
            }

            if (url.includes('application/pdf')) {
                return Promise.resolve({
                    headers: {
                        get: (header: string) => {
                            if (header === 'Content-Type') return 'application/pdf';
                            return null;
                        },
                    },
                    blob: () => Promise.resolve(new Blob()), // You can customize the Blob if needed
                } as unknown as Response);
            }

            return Promise.reject(new Error('Network error'));
        }
    );

    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', { value: 1700, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true });

});

describe('createPopover', () => {
    let options: PopoverOptions;

    beforeEach(() => {
        options = {
            parentElement: document.createElement('div'),
            targetUrl: new URL('http://example.com'),
            linkElement: document.createElement('a') as unknown as HTMLLinkElement,
        };
    });

    it('should create a popover element', async () => {
        const popover = await createPopover(options);
        expect(popover).toBeInstanceOf(HTMLElement);
        expect(popover.classList.contains('popover')).toBe(true);
    });

    it('should handle HTML content', async () => {
        options.targetUrl = new URL('http://example.com/text/html');
        const popover = await createPopover(options);
        const inner = popover.querySelector('.popover-inner');
        expect(inner?.innerHTML).toContain('<div class="popover-hint">Test HTML Content</div>');
        expect(inner?.textContent).toContain('Test HTML Content');
    });

    it('should handle image content', async () => {
        (global.fetch as jest.Mock).mockImplementationOnce(() =>
            Promise.resolve({
                headers: {
                    get: () => 'image/jpeg',
                },
                blob: () => Promise.resolve(new Blob()),
            } as unknown as Response)
        );

        const popover = await createPopover(options);
        const img = popover.querySelector('img');
        expect(img).toBeTruthy();
        expect(img?.src).toBe('http://example.com/');
    });

    it('should handle error cases', async () => {
        (global.fetch as jest.Mock).mockImplementationOnce(() =>
            Promise.reject(new Error('Network error'))
        );

        const popover = await createPopover(options);
        const inner = popover.querySelector('.popover-inner');
        expect(inner?.textContent).toBe('Error loading content');
    });

    it('should append "-popover" to all IDs in the popover content', async () => {
        const htmlContent = `
          <div class="popover-hint">
            <h1 id="heading1">Heading 1</h1>
            <p id="para1">Paragraph 1</p>
            <div id="div1">
              <h2 id="heading2">Heading 2</h2>
            </div>
          </div>
        `;

        (global.fetch as jest.Mock).mockImplementationOnce(() =>
            Promise.resolve({
                headers: {
                    get: () => 'text/html',
                },
                text: () => Promise.resolve(htmlContent),
            } as unknown as Response)
        );

        const popover = await createPopover(options);
        const inner = popover.querySelector('.popover-inner');

        expect(inner?.querySelector('#heading1-popover')).toBeTruthy();
        expect(inner?.querySelector('#para1-popover')).toBeTruthy();
        expect(inner?.querySelector('#div1-popover')).toBeTruthy();
        expect(inner?.querySelector('#heading2-popover')).toBeTruthy();
    });
});

// initialLeft = linkLeft - popoverWidth - POPOVER_PADDING
// maxLeft = window.innerWidth - popoverWidth - POPOVER_PADDING
// minLeft = POPOVER_PADDING
describe('computeLeft', () => {
    it.each`
        linkLeft | popoverWidth | expected
        ${0}     | ${150}       | ${5} 
        ${500}   | ${100}       | ${395}
        ${0}     | ${50}        | ${5}
    `('should compute left position correctly for linkLeft=$linkLeft, popoverWidth=$popoverWidth', ({ linkLeft, popoverWidth, expected }) => {
        const linkRect = { left: linkLeft } as DOMRect;
        expect(computeLeft(linkRect, popoverWidth)).toBe(expected);
    });
});


describe('computeTop', () => {
    const originalScrollY = window.scrollY;

    beforeEach(() => {
        Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
    });

    afterEach(() => {
        Object.defineProperty(window, 'scrollY', { value: originalScrollY, configurable: true });
    });

    // initialTop = 0.5 * (linkTop + linkBottom) - 0.5 * popoverHeight + scrollY
    // minTop = scrollY + POPOVER_PADDING
    // maxTop = scrollY + window.innerHeight - popoverHeight - POPOVER_PADDING
    // top = max(minTop, Math.min(initialTop, maxTop))
    it.each`
        linkTop | linkBottom | popoverHeight | scrollY | expected
        ${50}   | ${100}     | ${80}         | ${0}    | ${35}
        ${10}   | ${60}      | ${200}        | ${0}    | ${5}
        ${500}  | ${550}     | ${100}        | ${100}  | ${575} 
        ${0}    | ${50}      | ${60}         | ${200}  | ${205}
        ${10000} | ${10050}  | ${100}        | ${0}    | ${663}
    `('should compute top position correctly for linkTop=$linkTop, linkBottom=$linkBottom, popoverHeight=$popoverHeight, scrollY=$scrollY',
        ({ linkTop, linkBottom, popoverHeight, scrollY, expected }) => {
            // TODO is this changing it globally?
            Object.defineProperty(window, 'scrollY', { value: scrollY, configurable: true });

            const linkRect = { top: linkTop, bottom: linkBottom } as DOMRect;
            expect(computeTop(linkRect, popoverHeight)).toBe(expected);
        });
});

describe('setPopoverPosition', () => {
    let popoverElement: HTMLElement;
    let linkElement: HTMLLinkElement;
    let centerColumn: HTMLElement;
    let rightColumn: HTMLElement;

    beforeEach(() => {
        popoverElement = document.createElement('div');
        linkElement = document.createElement('a') as unknown as HTMLLinkElement;
        centerColumn = document.createElement('div');
        rightColumn = document.createElement('div');

        centerColumn.className = 'center';
        rightColumn.className = 'right';

        document.body.appendChild(centerColumn);
        document.body.appendChild(rightColumn);

        // Mock scroll position
        Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
    });

    afterEach(() => {
        document.body.removeChild(centerColumn);
        document.body.removeChild(rightColumn);
    });

    // initialTop = 0.5 * (linkTop + linkBottom) - 0.5 * popoverHeight + scrollY  
    // minTop = scrollY + POPOVER_PADDING
    // maxTop = scrollY + window.innerHeight - popoverHeight - POPOVER_PADDING
    // top = max(minTop, Math.min(initialTop, maxTop))

    // initialLeft = linkLeft - popoverWidth - POPOVER_PADDING 
    // maxLeft = window.innerWidth - popoverWidth - POPOVER_PADDING 
    // minLeft = POPOVER_PADDING
    // left = max(minLeft, Math.min(initialLeft, maxLeft))
    it.each`
        linkLeft | linkTop | linkBottom | popoverWidth | popoverHeight | expectedLeft | expectedTop
        ${100}   | ${50}   | ${100}     | ${150}       | ${80}         | ${5}         | ${35}
        ${10}    | ${10}   | ${60}      | ${150}       | ${200}        | ${5}         | ${5}
        ${500}   | ${500}  | ${550}     | ${100}       | ${100}        | ${395}       | ${475}
    `('should set position correctly for link at ($linkLeft, $linkTop) with popover size ($popoverWidth, $popoverHeight)',
        ({ linkLeft, linkTop, linkBottom, popoverWidth, popoverHeight, expectedLeft, expectedTop }) => {
            jest.spyOn(linkElement, 'getBoundingClientRect').mockReturnValue({
                left: linkLeft,
                top: linkTop,
                bottom: linkBottom,
            } as DOMRect);
            Object.defineProperty(popoverElement, 'offsetWidth', { value: popoverWidth });
            Object.defineProperty(popoverElement, 'offsetHeight', { value: popoverHeight });

            setPopoverPosition(popoverElement, linkElement);

            expect(popoverElement.style.left).toBe(`${expectedLeft}px`);
            expect(popoverElement.style.top).toBe(`${expectedTop}px`);
        });

    it('should position popover correctly when close to left edge', () => {
        jest.spyOn(linkElement, 'getBoundingClientRect').mockReturnValue({
            bottom: 100,
            left: 50,
            right: 150,
            top: 80,
            width: 100,
            height: 20,
        } as DOMRect);

        jest.spyOn(centerColumn, 'getBoundingClientRect').mockReturnValue({
            left: 0,
        } as DOMRect);

        Object.defineProperty(popoverElement, 'offsetWidth', { value: 200 });
        Object.defineProperty(popoverElement, 'offsetHeight', { value: 100 });

        setPopoverPosition(popoverElement, linkElement);

        const left = parseInt(popoverElement.style.left);
        const top = parseInt(popoverElement.style.top);

        const targetLeft = computeLeft(linkElement.getBoundingClientRect(), popoverElement.offsetWidth);
        expect(left).toBe(targetLeft);

        const targetTop = computeTop(linkElement.getBoundingClientRect(), popoverElement.offsetHeight);
        expect(top).toBe(targetTop);
    });

    it('should set popover position within bounds when link is near the bottom edge', () => {
        jest.spyOn(linkElement, 'getBoundingClientRect').mockReturnValue({
            bottom: 750,
            left: 500,
            right: 600,
            top: 730,
            width: 100,
            height: 20,
        } as DOMRect);

        Object.defineProperty(popoverElement, 'offsetWidth', { value: 200 });
        Object.defineProperty(popoverElement, 'offsetHeight', { value: 100 });

        setPopoverPosition(popoverElement, linkElement);

        const left = parseInt(popoverElement.style.left);
        const top = parseInt(popoverElement.style.top);

        const targetLeft = computeLeft(linkElement.getBoundingClientRect(), popoverElement.offsetWidth);
        expect(left).toBe(targetLeft);

        const targetTop = computeTop(linkElement.getBoundingClientRect(), popoverElement.offsetHeight);
        expect(top).toBe(targetTop);
    });
});

it('should set popover position within bounds when page is scrolled', () => {
    Object.defineProperty(window, 'scrollY', { value: 500 });

    const linkElement = document.createElement('a') as unknown as HTMLLinkElement;

    jest.spyOn(linkElement, 'getBoundingClientRect').mockReturnValue({
        bottom: 600,
        left: 500,
        right: 600,
        top: 580,
        width: 100,
        height: 20,
    } as DOMRect);

    const popoverElement = document.createElement('div');
    Object.defineProperty(popoverElement, 'offsetWidth', { value: 200 });
    Object.defineProperty(popoverElement, 'offsetHeight', { value: 100 });

    setPopoverPosition(popoverElement, linkElement);

    const left = parseInt(popoverElement.style.left);
    const top = parseInt(popoverElement.style.top);

    const targetLeft = computeLeft(linkElement.getBoundingClientRect(), popoverElement.offsetWidth);
    expect(left).toBe(targetLeft);

    const targetTop = computeTop(linkElement.getBoundingClientRect(), popoverElement.offsetHeight);
    expect(top).toBe(targetTop);
});

describe('attachPopoverEventListeners', () => {
    let popoverElement: HTMLElement;
    let linkElement: HTMLLinkElement;
    let cleanup: () => void;

    beforeEach(() => {
        popoverElement = document.createElement('div');
        linkElement = document.createElement('a') as unknown as HTMLLinkElement;
        cleanup = attachPopoverEventListeners(popoverElement, linkElement);
    });

    afterEach(() => {
        cleanup();
    });

    it('should show popover on link mouseenter', () => {
        linkElement.dispatchEvent(new MouseEvent('mouseenter'));
        expect(popoverElement.classList.contains('popover-visible')).toBe(true);
    });

    it('should remove popover on link mouseleave', () => {
        linkElement.dispatchEvent(new MouseEvent('mouseleave'));
        jest.advanceTimersByTime(300);
        expect(popoverElement.classList.contains('visible')).toBe(false);
    });

    it('should handle popover mouseenter and mouseleave', () => {
        popoverElement.dispatchEvent(new MouseEvent('mouseenter'));
        popoverElement.dispatchEvent(new MouseEvent('mouseleave'));
        jest.advanceTimersByTime(300);
        expect(popoverElement.classList.contains('visible')).toBe(false);
    });

    it('should handle click on popover', () => {
        const mockHref = 'http://example.com/';
        linkElement.href = mockHref;
        Object.defineProperty(window, 'location', {
            value: { href: '' },
            writable: true,
        });

        popoverElement.dispatchEvent(new MouseEvent('click'));
        expect(window.location.href).toBe(mockHref);
    });
});

describe('escapeLeadingIdNumber', () => {
    it('should escape leading ID numbers', () => {
        expect(escapeLeadingIdNumber('#1 Test')).toBe('#_1 Test');
        expect(escapeLeadingIdNumber('No number')).toBe('No number');
        expect(escapeLeadingIdNumber('#123 Multiple digits')).toBe('#_123 Multiple digits');
    });
});