import { crossfitBoxEvents } from '../../utils/crossfitBoxEvents';

describe('crossfitBoxEvents', () => {
  it('should emit event to all subscribers', () => {
    const listener1 = jest.fn();
    const listener2 = jest.fn();

    crossfitBoxEvents.subscribe(listener1);
    crossfitBoxEvents.subscribe(listener2);

    crossfitBoxEvents.emit();

    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);
  });

  it('should unsubscribe listener', () => {
    const listener = jest.fn();

    const unsubscribe = crossfitBoxEvents.subscribe(listener);

    crossfitBoxEvents.emit();
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();

    crossfitBoxEvents.emit();
    expect(listener).toHaveBeenCalledTimes(1); // Should not be called again
  });

  it('should handle multiple subscriptions and unsubscriptions', () => {
    const listener1 = jest.fn();
    const listener2 = jest.fn();
    const listener3 = jest.fn();

    const unsubscribe1 = crossfitBoxEvents.subscribe(listener1);
    const unsubscribe2 = crossfitBoxEvents.subscribe(listener2);
    crossfitBoxEvents.subscribe(listener3);

    crossfitBoxEvents.emit();
    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);
    expect(listener3).toHaveBeenCalledTimes(1);

    unsubscribe1();
    unsubscribe2();

    crossfitBoxEvents.emit();
    expect(listener1).toHaveBeenCalledTimes(1); // Still 1
    expect(listener2).toHaveBeenCalledTimes(1); // Still 1
    expect(listener3).toHaveBeenCalledTimes(2); // Incremented
  });

  it('should not fail when emitting with no subscribers', () => {
    expect(() => {
      crossfitBoxEvents.emit();
    }).not.toThrow();
  });
});
