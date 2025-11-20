import { nextTick } from 'vue';
import type { ImmutablesProps } from '../types/immutables';

const IMMUTABLE_ATTR = 'data-immutable';
const IMMUTABLE_CLASS = 'pan-immutable';

export const useImmutables = (props: ImmutablesProps | undefined, contentRef: { value: HTMLElement | null }) => {
  /**
   * Mark elements as immutable (non-editable) in the DOM
   */
  const markImmutables = async () => {
    if (!contentRef.value || !props) return;
    
    await nextTick();
    
    // Find all elements with data-immutable attribute
    const immutables = contentRef.value.querySelectorAll(`[${IMMUTABLE_ATTR}]`);
    
    immutables.forEach((element) => {
      const el = element as HTMLElement;
      
      // Add immutable class for styling
      el.classList.add(IMMUTABLE_CLASS);
      
      // Make element non-editable
      el.setAttribute('contenteditable', 'false');
      
      // Prevent editing events
      el.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
      
      el.addEventListener('keydown', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });
  };

  /**
   * Serialize immutable elements
   */
  const serializeImmutables = (html: string): string => {
    if (!props?.serialization || !contentRef.value) return html;
    
    // Create a temporary container to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Find all immutable elements
    const immutables = temp.querySelectorAll(`.${IMMUTABLE_CLASS}, [${IMMUTABLE_ATTR}]`);
    
    immutables.forEach((element) => {
      const el = element as HTMLElement;
      
      if (typeof props.serialization === 'function') {
        // Custom serialization function
        const serialized = props.serialization(el);
        if (serialized) {
          // Replace element with serialized HTML
          const wrapper = document.createElement('div');
          wrapper.innerHTML = serialized;
          el.parentNode?.replaceChild(wrapper.firstChild || el, el);
        }
      } else if (typeof props.serialization === 'string') {
        // Template-based serialization (simplified - would need template engine)
        // For now, just preserve the element
        el.setAttribute(IMMUTABLE_ATTR, 'true');
      }
    });
    
    return temp.innerHTML;
  };

  /**
   * Deserialize immutable elements
   */
  const deserializeImmutables = async (html: string): Promise<string> => {
    if (!props?.deserialization || !contentRef.value) return html;
    
    // Create a temporary container to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Find all elements that should be immutable
    // Look for elements with data-immutable or specific patterns
    const immutables = temp.querySelectorAll(`[${IMMUTABLE_ATTR}], .${IMMUTABLE_CLASS}`);
    
    immutables.forEach((element) => {
      const el = element as HTMLElement;
      
      if (props.deserialization) {
        // Create a clone for the immutable element
        const immutableClone = el.cloneNode(true) as HTMLElement;
        
        // Call deserialization callback
        const deserialized = props.deserialization(el, immutableClone);
        
        if (deserialized && deserialized !== el) {
          // Replace with deserialized element
          el.parentNode?.replaceChild(deserialized, el);
        } else {
          // Mark as immutable
          el.setAttribute(IMMUTABLE_ATTR, 'true');
        }
      }
    });
    
    return temp.innerHTML;
  };

  /**
   * Make an element immutable
   */
  const makeImmutable = (element: HTMLElement) => {
    element.setAttribute(IMMUTABLE_ATTR, 'true');
    element.classList.add(IMMUTABLE_CLASS);
    element.setAttribute('contenteditable', 'false');
    markImmutables();
  };

  /**
   * Check if an element is immutable
   */
  const isImmutable = (element: HTMLElement): boolean => {
    return element.hasAttribute(IMMUTABLE_ATTR) || element.classList.contains(IMMUTABLE_CLASS);
  };

  return {
    markImmutables,
    serializeImmutables,
    deserializeImmutables,
    makeImmutable,
    isImmutable,
  };
};




