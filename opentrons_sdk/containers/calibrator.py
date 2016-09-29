import copy


class Calibrator(object):
    # Returns calibrated coordinates relative to deck
    def convert(self,
                calibration_data,
                placeable,
                coordinates=(0, 0, 0)):
        path = placeable.get_path()
        calibrated_placeable = self.apply_calibration(
            calibration_data,
            placeable.get_deck())

        for name in path:
            calibrated_placeable = calibrated_placeable[name]

        calibrated_deck = calibrated_placeable.get_deck()
        calibrated_coordinates = calibrated_placeable.coordinates(
            calibrated_deck)

        return tuple(a + b for a, b in
                     zip(coordinates, calibrated_coordinates))

    def apply_calibration(self, calibration_data, placeable):
        placeable = copy.deepcopy(placeable)
        self.apply_calibration_recursive(calibration_data, placeable)
        return placeable

    def apply_calibration_recursive(self, calibration_data, placeable):
        for name, data in calibration_data.items():
            child = placeable.children[name]

            if 'delta' in data:
                child['coordinates'] = tuple(
                    a + b for a, b in zip(child['coordinates'],
                                          data['delta'])
                )
            if 'children' in data:
                self.apply_calibration_recursive(
                    data['children'], child['instance'])

    def calibrate(self,
                  calibration_data,
                  placeable,
                  actual,
                  expected=(0, 0, 0)):
        coordinates_to_deck = placeable.coordinates(placeable.get_deck())
        expected_to_deck = tuple(
            a + b for a, b in zip(expected, coordinates_to_deck))

        delta = tuple(a - b for a, b in zip(actual, expected_to_deck))
        path = placeable.get_path()
        calibration_data = copy.deepcopy(calibration_data)

        current = {'children': calibration_data}
        for i, name in enumerate(path):
            children = current['children']
            if name not in children:
                if i == len(path) - 1:
                    children[name] = {}
                else:
                    children[name] = {'children': {}}
            current = children[name]

        current['delta'] = delta
        return calibration_data
