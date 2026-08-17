import Testing
@testable import HarmoniAgent

@Test
func normalizesCoreAudioScalarsToRoundedPercentages() {
    #expect(normalizedAudioVolumePercentage(0) == 0)
    #expect(normalizedAudioVolumePercentage(0.504) == 50)
    #expect(normalizedAudioVolumePercentage(0.505) == 51)
    #expect(normalizedAudioVolumePercentage(1) == 100)
}
