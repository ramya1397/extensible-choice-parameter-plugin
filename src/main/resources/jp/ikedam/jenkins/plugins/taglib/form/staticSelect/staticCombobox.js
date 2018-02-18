/*
 * The MIT License
 * 
 * Copyright (c) 2012-2013 IKEDA Yasuyuki
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
Behaviour.register({"SELECT.staticCombobox": function(e) {
    var items = [];
    /*
     * Changes from the original 1:
     *   Original behavior: Retrieves the contents whenever the value is updated.
     *   Changed behavior : Retrieves the contents only once in initializing.
     */
    $A(e.getElementsByTagName("option")).each(function(o){
        items.push(o.value);
    });
    
    /*
     * Changes from the original 2:
     *   Original behavior: Bind ComboBox to the INPUT field generated by Jelly.
     *   Changed behavior :
     *      Jelly generates SELECT field.
     *      Bind ComboBox to the INPUT field generated by JavaScript, copying from the SELECT field.
     */
    var orig = e;
    var e = document.createElement("INPUT");
    for(var i = 0; i < orig.attributes.length; ++i){
        e.setAttribute(orig.attributes[i].name, orig.attributes[i].value);
    }
    e.setAttribute("value", $(orig).value);
    
    orig.parentNode.insertBefore(e, orig);
    orig.parentNode.removeChild(orig);
    
    /*
     * Changes from the original 3:
     *   Original behavior: Show candidates that start with the current incomplete input.
     *   Changed behavior : Show candidates that contain the current incomplete input.
     */
    var c = new ComboBox(e,function(value) {
        return items.filter(function (item) {
            return item.indexOf(value) > -1;
        });
    }, {});
    
    /*
     * Changes from the original 4:
     *   Original behavior: The first choice is selected when the dropdown is shown.
     *   Changed behavior : The choice matching the current incomplete input is selected  when the dropdown is shown.
     */
    
    c.oldPopulateDropdown = c.populateDropdown;
    c.populateDropdown = function(){
        this.oldPopulateDropdown();
        this.selectedItemIndex = -1;
        for(var i = 0; i < this.availableItems.length; ++i){
            if(this.availableItems[i] == this.field.value){
                this.selectedItemIndex = i;
                break;
            }
        }
        this.updateSelection();
    }
    
    /*
     * Changes from the original 5:
     *   Original behavior: Show the dropdown when a character is input.
     *   Changed behavior : Show the dropdown when a field is selected.
     */
    e.oldonfocus = e.onfocus;
    e.onfocus = function(e){
        var oldonsubmit = this.form.onsubmit;
        this.oldonfocus(e);
        if(this.form.oldonsubmit != oldonsubmit){
            // Deal with the problem in some versions of Jenkins:
            // Too early saving of the onsubmit of the form results in
            // the failure of onsubmit.
            // (in combobox.js, onfucus handler)
            this.form.oldonsubmit = oldonsubmit;
        }
        this.comboBox.valueChanged();
    }
}});
